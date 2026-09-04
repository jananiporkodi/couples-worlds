export const SESSION_COOKIE_NAME = "olw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

/** Which partner is using this device - remembered long-term (separate from the shared passcode session) so notifications/emails know who did what. */
export const PARTNER_COOKIE_NAME = "olw_partner";
export const PARTNER_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year
export type PartnerId = "partner_a" | "partner_b";

export function isValidPartnerId(value: string | undefined | null): value is PartnerId {
  return value === "partner_a" || value === "partner_b";
}

/**
 * The session cookie's value is simply the passcode itself. That's fine here:
 * the cookie is httpOnly + secure (in production) so client-side JS and casual
 * inspection can't read it, and the passcode is already the single shared
 * secret for this private, two-person app. Keeping it this simple avoids
 * needing a session store or signing keys for something with no user accounts.
 */
export function isCorrectPasscode(input: string): boolean {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    throw new Error(
      "APP_PASSCODE is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  return input.trim() === expected.trim();
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const expected = process.env.APP_PASSCODE;
  if (!expected) return false;
  return value === expected.trim();
}
