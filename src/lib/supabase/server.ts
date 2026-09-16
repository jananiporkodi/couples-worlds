import "server-only";
import { Pool } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionValue } from "../auth";

/**
 * ---------------------------------------------------------------------------
 * NEON MIGRATION NOTE
 * ---------------------------------------------------------------------------
 * couples-worlds runs on Neon (Postgres) + Vercel Blob instead of Supabase.
 * Rather than rewrite every call site in src/lib/data.ts and the various
 * app/**\/actions.ts files (they all use the `supabase.from(table)...` and
 * `supabase.storage.from(bucket)...` chainable API), this file implements a
 * small compatibility shim that speaks the same API but is backed by a real
 * Postgres connection (via @neondatabase/serverless) and Vercel Blob for
 * file storage. Every caller elsewhere in the app is unchanged.
 *
 * Supported surface (this is everything the app actually uses):
 *   .from(table).select(cols).eq(col, val).in(col, vals).gte(col, val)
 *     .is(col, val).order(col, {ascending}).limit(n).single()
 *   .from(table).insert(row | row[]).select(cols).single()
 *   .from(table).update(partial).eq(col, val).select(cols)
 *   .from(table).upsert(row, { onConflict: col }).select(cols)
 *   .from(table).delete().eq(col, val).in(col, vals).is(col, val)
 *   .storage.from(bucket).upload(path, buffer, { contentType, upsert })
 *   .storage.from(bucket).getPublicUrl(path)
 *
 * Known simplifications vs. real supabase-js:
 *   - `.single()` returns `null` when zero/many rows match, rather than
 *     throwing PostgREST's "multiple/no rows" error. No call site in this
 *     app relies on that error, so this is safe here.
 *   - Row Level Security is gone. That's not a regression: every RLS policy
 *     in the original Supabase project was `USING (true)` for the anon role
 *     (i.e. no real per-row security), so access control has always lived
 *     at the app layer (the passcode gate in src/middleware.ts), not the DB.
 *
 * ---------------------------------------------------------------------------
 * MULTI-TENANT (world_id) SCOPING - Phase 2
 * ---------------------------------------------------------------------------
 * Every couple's data now lives behind a `worlds` row, and every content
 * table has a NOT NULL `world_id` column. Rather than thread a worldId
 * parameter through every one of the ~60 functions in data.ts and every
 * actions.ts file (a huge, easy-to-get-wrong blast radius across dozens of
 * files), that scoping is applied once, centrally, right here: any query
 * against a table in WORLD_SCOPED_TABLES automatically gets `world_id`
 * added to its WHERE clause (select/update/delete) or its inserted row
 * (insert/upsert). No call site anywhere else in the app needs to know
 * world_id exists - exactly the same "don't touch call sites" philosophy
 * the rest of this shim already uses for the Supabase -> Neon migration.
 *
 * The world_id itself comes from the session cookie (src/lib/auth.ts +
 * src/lib/world.ts) - the cookie's value *is* the signed-in world's id, so
 * reading it here needs no extra DB round trip. See resolveWorldId() below
 * for the one exception (reading settings before login, for the lock
 * screen) and getCurrentWorldId() in src/lib/world.ts for the deeper check
 * (does this id still resolve to an *active* world) that every authenticated
 * page relies on via the (app) route group's layout.
 * ---------------------------------------------------------------------------
 */

let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Copy .env.local.example to .env.local and fill it in with your Neon connection string."
    );
  }
  pool = new Pool({ connectionString });
  return pool;
}

// Every table except `worlds` itself is scoped per-world.
const WORLD_SCOPED_TABLES = new Set([
  "bucket_items",
  "countdowns",
  "daily_moods",
  "daily_questions",
  "expenses",
  "gallery",
  "kisses",
  "love_jar",
  "memories",
  "moods",
  "notes",
  "places",
  "plans",
  "playlists",
  "push_subscriptions",
  "settings",
  "timeline_events",
  "todos",
  "wishlist",
]);

// A couple of world-scoped tables have their real uniqueness constraint as
// (world_id, <original column(s)>) rather than <original column(s)> alone
// (see the Phase 1/2 migrations) - their upsert's ON CONFLICT target needs
// world_id prepended to match. Others (e.g. push_subscriptions, unique on
// endpoint alone - a device's push endpoint doesn't vary by world) keep
// whatever conflict target the caller passed in unchanged.
const CONFLICT_PREPEND_WORLD = new Set(["settings", "daily_moods"]);

/**
 * The signed-in world's id, straight from the session cookie - no DB lookup,
 * since the cookie's value already *is* the world id (see src/lib/world.ts).
 * Returns null when there's no session (not logged in yet, or a Server
 * Component rendering outside a request's cookie context).
 */
function getSessionWorldId(): string | null {
  try {
    const value = cookies().get(SESSION_COOKIE_NAME)?.value;
    // A browser that still has a pre-migration session cookie carries the
    // old shared passcode as its value, not a world id - treat that exactly
    // like "not signed in" rather than letting it crash a uuid column.
    return isValidSessionValue(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Resolves which world a query should be scoped to. Writes always require a
 * real session - there is no couple-neutral way to save a memory, note, etc.,
 * so a missing cookie there is a bug (or a forged request past middleware)
 * and fails loudly rather than guessing. Reads get one narrow fallback: the
 * root layout and the /lock screen read `settings` (for partner names/theme)
 * before the visitor has logged in at all. Until Phase 3/4 give each world
 * its own URL, there's no slug to resolve there either, so this falls back
 * to the single active world - correct today (one couple), and this
 * fallback becomes unreachable once self-serve onboarding (Phase 4) and
 * per-world routing (Phase 3) land, since every page will have a real slug
 * or session by then.
 */
async function resolveWorldId(mode: Mode): Promise<string | null> {
  const fromCookie = getSessionWorldId();
  if (fromCookie) return fromCookie;

  if (mode !== "select") {
    throw new Error(
      "No active world session - refusing to write world-scoped data without one. (Are you calling this outside the /lock flow?)"
    );
  }

  const result = await getPool().query<{ id: string }>(
    `SELECT id FROM worlds WHERE status = 'active' ORDER BY created_at ASC LIMIT 1`
  );
  return result.rows[0]?.id ?? null;
}

type FilterOp = "=" | "in" | "is" | "gte";
type Filter = { col: string; op: FilterOp; val: unknown };
type Mode = "select" | "insert" | "update" | "upsert" | "delete";
type Row = Record<string, unknown>;

export interface PostgrestResult<T = any> {
  data: T | null;
  error: unknown;
  count?: number;
}

class QueryBuilder<T = any> implements PromiseLike<PostgrestResult<T>> {
  private mode: Mode = "select";
  private selectCols = "*";
  private filters: Filter[] = [];
  private orderCol?: string;
  private orderAsc = true;
  private limitN?: number;
  private wantSingle = false;
  private wantReturning = false;
  private wantCount = false;
  private payload?: Row | Row[];
  private conflictCol?: string;
  private readonly scoped: boolean;

  constructor(private table: string) {
    this.scoped = WORLD_SCOPED_TABLES.has(table);
  }

  select(cols: string = "*", opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    this.selectCols = cols;
    this.wantReturning = true;
    this.wantCount = !!opts?.count;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ col, op: "=", val });
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push({ col, op: "in", val: vals });
    return this;
  }
  is(col: string, val: null | boolean) {
    this.filters.push({ col, op: "is", val });
    return this;
  }
  gte(col: string, val: unknown) {
    this.filters.push({ col, op: "gte", val });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.wantSingle = true;
    return this;
  }
  insert(payload: Row | Row[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }
  upsert(payload: Row, opts?: { onConflict?: string }) {
    this.mode = "upsert";
    this.payload = payload;
    this.conflictCol = opts?.onConflict ?? "id";
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }

  private buildWhere(params: unknown[], filters: Filter[]): string {
    if (filters.length === 0) return "";
    const clauses = filters.map((f) => {
      if (f.op === "is") {
        // `.is(col, null)` -> IS NULL; `.is(col, true/false)` -> IS TRUE/FALSE. No params consumed.
        if (f.val === null) return `${f.col} IS NULL`;
        return `${f.col} IS ${f.val ? "TRUE" : "FALSE"}`;
      }
      params.push(f.val);
      if (f.op === "in") return `${f.col} = ANY($${params.length})`;
      if (f.op === "gte") return `${f.col} >= $${params.length}`;
      return `${f.col} = $${params.length}`;
    });
    return ` WHERE ${clauses.join(" AND ")}`;
  }

  private async execute(): Promise<PostgrestResult<T>> {
    try {
      const params: unknown[] = [];
      let text: string;

      const worldId = this.scoped ? await resolveWorldId(this.mode) : null;
      const effectiveFilters: Filter[] =
        this.scoped && worldId ? [{ col: "world_id", op: "=", val: worldId }, ...this.filters] : this.filters;

      if (this.mode === "select") {
        text = `SELECT ${this.selectCols} FROM ${this.table}`;
        text += this.buildWhere(params, effectiveFilters);
        if (this.orderCol) text += ` ORDER BY ${this.orderCol} ${this.orderAsc ? "ASC" : "DESC"}`;
        if (this.limitN != null) {
          params.push(this.limitN);
          text += ` LIMIT $${params.length}`;
        }
      } else if (this.mode === "insert") {
        const rows = (Array.isArray(this.payload) ? this.payload : [this.payload as Row]).map((row) =>
          this.scoped && worldId ? { world_id: worldId, ...row } : row
        );
        const cols = Object.keys(rows[0]);
        const valuesSql = rows
          .map((row) => `(${cols.map((c) => { params.push(row[c]); return `$${params.length}`; }).join(", ")})`)
          .join(", ");
        text = `INSERT INTO ${this.table} (${cols.join(", ")}) VALUES ${valuesSql}`;
        if (this.wantReturning) text += ` RETURNING ${this.selectCols}`;
      } else if (this.mode === "update") {
        const payload = this.payload as Row;
        const cols = Object.keys(payload);
        const setSql = cols.map((c) => { params.push(payload[c]); return `${c} = $${params.length}`; }).join(", ");
        text = `UPDATE ${this.table} SET ${setSql}`;
        text += this.buildWhere(params, effectiveFilters);
        if (this.wantReturning) text += ` RETURNING ${this.selectCols}`;
      } else if (this.mode === "upsert") {
        const row = this.scoped && worldId ? { world_id: worldId, ...(this.payload as Row) } : (this.payload as Row);
        const cols = Object.keys(row);
        const placeholders = cols.map((c) => { params.push(row[c]); return `$${params.length}`; });
        const baseConflict = this.conflictCol ?? "id";
        const conflictTarget =
          this.scoped && worldId && CONFLICT_PREPEND_WORLD.has(this.table) ? `world_id, ${baseConflict}` : baseConflict;
        const conflictCols = conflictTarget.split(",").map((c) => c.trim());
        const updateSql = cols.filter((c) => !conflictCols.includes(c)).map((c) => `${c} = EXCLUDED.${c}`).join(", ");
        text = `INSERT INTO ${this.table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")}) ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateSql}`;
        if (this.wantReturning) text += ` RETURNING ${this.selectCols}`;
      } else {
        text = `DELETE FROM ${this.table}`;
        text += this.buildWhere(params, effectiveFilters);
        if (this.wantReturning) text += ` RETURNING ${this.selectCols}`;
      }

      const result = await getPool().query(text, params);
      let data: unknown = result.rows;
      if (this.wantSingle) data = (result.rows[0] as T | undefined) ?? null;
      const out: PostgrestResult<T> = { data: data as T, error: null };
      if (this.wantCount) out.count = result.rowCount ?? (result.rows as unknown[]).length;
      return out;
    } catch (error) {
      return { data: null, error };
    }
  }

  then<R1 = PostgrestResult<T>, R2 = never>(
    onfulfilled?: ((value: PostgrestResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

// ---------------------------------------------------------------------------
// Storage (Vercel Blob) — mirrors the two Supabase Storage calls this app
// makes: `.upload(path, buffer, opts)` and `.getPublicUrl(path)`.
//
// Vercel Blob's `put()` returns the final URL at upload time rather than
// letting you compute it separately from a path, so this shim caches the
// URL from the most recent upload of a given key. Every call site in this
// codebase calls upload() immediately followed by getPublicUrl() for the
// same path within the same request, so this is safe in practice.
// ---------------------------------------------------------------------------

const uploadedUrlCache = new Map<string, string>();

function storageFrom(bucket: string) {
  return {
    async upload(path: string, body: Buffer, opts?: { contentType?: string; upsert?: boolean }) {
      try {
        const { put } = await import("@vercel/blob");
        const key = `${bucket}/${path}`;
        const blob = await put(key, body, {
          access: "public",
          contentType: opts?.contentType,
          addRandomSuffix: false,
        });
        uploadedUrlCache.set(key, blob.url);
        return { data: { path }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    getPublicUrl(path: string) {
      const key = `${bucket}/${path}`;
      const url = uploadedUrlCache.get(key);
      if (!url) {
        console.warn(
          `[storage] getPublicUrl("${key}") called without a matching upload() in this process — URL unavailable.`
        );
      }
      return { data: { publicUrl: url ?? "" } };
    },
  };
}

// ---------------------------------------------------------------------------
// Public API — same shape as the old `SupabaseClient` slice this app used.
// ---------------------------------------------------------------------------

interface DbClient {
  from<T = any>(table: string): QueryBuilder<T>;
  storage: { from(bucket: string): ReturnType<typeof storageFrom> };
}

let client: DbClient | null = null;

export function getSupabaseServerClient(): DbClient {
  if (client) return client;
  client = {
    from: <T = any>(table: string) => new QueryBuilder<T>(table),
    storage: { from: storageFrom },
  };
  return client;
}
