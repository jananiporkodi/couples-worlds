import "server-only";
import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./supabase/server";
import { SESSION_COOKIE_NAME, isValidSessionValue } from "./auth";

/** Only used as a last-resort redirect target when no slug is available at all (shouldn't normally happen once middleware is in place - see src/middleware.ts). */
const FALLBACK_SLUG = "our-world";

export type WorldStatus = "created" | "onboarding" | "active" | "disabled" | "archived";

export interface World {
  id: string;
  name: string;
  slug: string;
  status: WorldStatus;
  access_code_hash: string | null;
  [key: string]: unknown;
}

function hashPasscode(passcode: string): string {
  return createHash("sha256").update(passcode.trim()).digest("hex");
}

/**
 * Checks a passcode against active worlds' access codes and returns the
 * matching world, or null. Superseded by verifyPasscodeForSlug now that
 * Phase 3 gives each world its own /w/{slug}/lock screen, but left in place
 * since the old top-level /lock route (unreachable now - middleware
 * redirects every bare path to /w/{slug}/...) still imports it.
 *
 * Self-healing bootstrap: the world seeded by the Phase 1/2 migration has no
 * access_code_hash yet (it was created by SQL, not through an onboarding
 * flow that sets one). The first successful login checked against the
 * legacy shared APP_PASSCODE env var backfills that world's hash, so every
 * later login goes through the real per-world code and the env var stops
 * mattering.
 */
export async function verifyPasscodeAndGetWorld(passcode: string): Promise<World | null> {
  const trimmed = passcode.trim();
  if (!trimmed) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("worlds").select("*").eq("status", "active");
  const worlds = (data as World[] | null) ?? [];

  const hash = hashPasscode(trimmed);
  const byCode = worlds.find((w) => w.access_code_hash === hash);
  if (byCode) return byCode;

  const legacy = process.env.APP_PASSCODE;
  if (legacy && legacy.trim() === trimmed) {
    const unbootstrapped = worlds.find((w) => !w.access_code_hash);
    if (unbootstrapped) {
      await supabase.from("worlds").update({ access_code_hash: hash }).eq("id", unbootstrapped.id);
      return { ...unbootstrapped, access_code_hash: hash };
    }
  }

  return null;
}

/** The active world at this slug, or null if the slug doesn't resolve to one (unknown, disabled, archived). */
export async function getWorldBySlug(slug: string): Promise<World | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("worlds").select("*").eq("slug", slug).eq("status", "active").single();
  return (data as World | null) ?? null;
}

/**
 * Checks a passcode against one specific world's access code (by slug) -
 * what every /w/{slug}/lock screen actually uses now. Same self-healing
 * bootstrap as verifyPasscodeAndGetWorld, scoped to just this one world.
 */
export async function verifyPasscodeForSlug(slug: string, passcode: string): Promise<World | null> {
  const trimmed = passcode.trim();
  if (!trimmed) return null;

  const world = await getWorldBySlug(slug);
  if (!world) return null;

  const hash = hashPasscode(trimmed);
  if (world.access_code_hash === hash) return world;

  const legacy = process.env.APP_PASSCODE;
  if (legacy && legacy.trim() === trimmed && !world.access_code_hash) {
    const supabase = getSupabaseServerClient();
    await supabase.from("worlds").update({ access_code_hash: hash }).eq("id", world.id);
    return { ...world, access_code_hash: hash };
  }

  return null;
}

/** The signed-in world, or null if there's no session or it no longer resolves to an active world (disabled/archived/deleted). */
export async function getCurrentWorld(): Promise<World | null> {
  const worldId = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!isValidSessionValue(worldId)) return null;

  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("worlds").select("*").eq("id", worldId).eq("status", "active").single();
  return (data as World | null) ?? null;
}

/**
 * Guarantees an active, signed-in world for every page under the (app)
 * route group, redirecting to /welcome otherwise. This is the one spot that
 * actually checks world *status* - the Neon query shim (src/lib/supabase/
 * server.ts) scopes every query to the session cookie's world id for
 * convenience, but it doesn't check whether that world is still active, so
 * a disabled/archived world's stale cookie would otherwise keep working.
 */
export async function getCurrentWorldId(): Promise<string> {
  const world = await getCurrentWorld();
  if (!world) {
    const slug = headers().get("x-world-slug") ?? FALLBACK_SLUG;
    redirect(`/w/${slug}/welcome`);
  }
  return world.id;
}
