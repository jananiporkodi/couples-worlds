/** UTC-safe day count between a "YYYY-MM-DD" string and another date, immune to server timezone. */
export function daysBetween(startDateStr: string, endDate: Date = new Date()): number {
  const [sy, sm, sd] = startDateStr.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  const ms = endUtc - startUtc;
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/** UTC-safe days remaining until a "YYYY-MM-DD" target date. Negative if it's already passed. */
export function daysUntil(targetDateStr: string, from: Date = new Date()): number {
  const [ty, tm, td] = targetDateStr.split("-").map(Number);
  const targetUtc = Date.UTC(ty, tm - 1, td);
  const startUtc = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const ms = targetUtc - startUtc;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function formatFriendlyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Deterministic "pick of the day" index into an array, stable per calendar day. */
export function dayOfYearIndex(length: number, date: Date = new Date()): number {
  if (length <= 0) return 0;
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % length;
}

/**
 * This app follows India Standard Time (IST, UTC+5:30) for anything that depends on "what day is it
 * right now" - regardless of whether the code runs in the user's browser or on Vercel's servers
 * (which run in UTC). Using the server's local clock for "today" would silently shift dates around
 * midnight IST, so any "today" default should go through these helpers instead of `new Date()`
 * timezone-naive math.
 */
const IST_TIME_ZONE = "Asia/Kolkata";

/** Today's calendar date in IST as "YYYY-MM-DD", correct no matter where this code executes. */
export function todayIST(): string {
  return toISTDateStr(new Date());
}

/** Converts any Date or ISO timestamp to its "YYYY-MM-DD" calendar day in IST. */
export function toISTDateStr(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date);
}

/** Ordinal suffix for a whole number, e.g. 1 -> "1st", 22 -> "22nd". */
export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
}

/**
 * Given a "YYYY-MM-DD" date, finds the next upcoming occurrence of that month/day (this year if not yet
 * passed, otherwise next year) and reports how many days remain plus which "occurrence" it will be
 * (years since the original date) - e.g. a birthday's occurrence is the age being turned, an
 * anniversary's occurrence is which numbered anniversary it is.
 */
export function nextAnniversary(dateStr: string, from: Date = new Date()): { daysRemaining: number; occurrence: number } {
  const [origYear, month, day] = dateStr.split("-").map(Number);
  const fromUtc = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());

  let year = from.getUTCFullYear();
  let candidateUtc = Date.UTC(year, month - 1, day);
  if (candidateUtc < fromUtc) {
    year += 1;
    candidateUtc = Date.UTC(year, month - 1, day);
  }

  const daysRemaining = Math.ceil((candidateUtc - fromUtc) / (1000 * 60 * 60 * 24));
  const occurrence = year - origYear;
  return { daysRemaining, occurrence };
}
