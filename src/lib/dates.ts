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
