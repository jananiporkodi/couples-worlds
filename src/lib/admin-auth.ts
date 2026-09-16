import "server-only";
import { createHash } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE_NAME = "olw_admin_session";
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function hash(value: string): string {
  return createHash("sha256").update(value.trim()).digest("hex");
}

/**
 * There's no per-admin account, same as a couple's world has one shared
 * passcode - here the one shared secret lives in the ADMIN_PASSCODE env
 * var. The session cookie stores a hash of it rather than a static marker
 * like "true", so it can't be forged by just setting a cookie by hand, and
 * rotating ADMIN_PASSCODE in Vercel instantly invalidates every existing
 * admin session next time it's checked.
 */
export function verifyAdminPasscode(passcode: string): boolean {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || !passcode.trim()) return false;
  return expected.trim() === passcode.trim();
}

export function adminSessionCookieValue(): string {
  return hash(process.env.ADMIN_PASSCODE ?? "");
}

/** True only if there's an ADMIN_PASSCODE configured at all, and the request's cookie matches its current hash. */
export function isAdminSession(): boolean {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  const cookieValue = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return !!cookieValue && cookieValue === hash(expected);
}
