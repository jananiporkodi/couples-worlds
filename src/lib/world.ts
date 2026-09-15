import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "./supabase/server";
import { SESSION_COOKIE_NAME } from "./auth";

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
 * matching world, or null. Until Phase 3 gives each world its own URL
 * (yourdomain.com/w/{slug}/lock), the single shared /lock screen has no slug
 * to narrow the search by, so this checks every active world - fine at
 * today's scale (one couple); a slug param will narrow this to one row once
 * routing is restructured.
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

/** The signed-in world, or null if there's no session or it no longer resolves to an active world (disabled/archived/deleted). */
export async function getCurrentWorld(): Promise<World | null> {
  const worldId = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!worldId) return null;

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
    redirect("/welcome");
  }
  return world.id;
}
