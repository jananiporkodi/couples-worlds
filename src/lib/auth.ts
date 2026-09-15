export const SESSION_COOKIE_NAME = "olw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Which partner is using this device - remembered long-term (separate from the world session) so notifications/emails know who did what. */
export const PARTNER_COOKIE_NAME = "olw_partner";
export const PARTNER_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
export type PartnerId = "partner_a" | "partner_b";

export function isValidPartnerId(value: string | undefined | null): value is PartnerId {
  return value === "partner_a" || value === "partner_b";
}

/**
 * The session cookie's value is the signed-in world's id (a uuid) - not the
 * passcode itself. Checking a passcode against a world's stored access code,
 * and issuing this cookie on success, lives in src/lib/world.ts
 * (verifyPasscodeAndGetWorld) since it needs DB access; this file stays
 * dependency-free so it's safe to import from anywhere (client or server).
 */
