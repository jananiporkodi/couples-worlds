const PHASES = [
  { emoji: "🌑", name: "New moon" },
  { emoji: "🌒", name: "Waxing crescent" },
  { emoji: "🌓", name: "First quarter" },
  { emoji: "🌔", name: "Waxing gibbous" },
  { emoji: "🌕", name: "Full moon" },
  { emoji: "🌖", name: "Waning gibbous" },
  { emoji: "🌗", name: "Last quarter" },
  { emoji: "🌘", name: "Waning crescent" },
] as const;

const SYNODIC_MONTH_DAYS = 29.530588861;
// A known new moon (Jan 6, 2000, 18:14 UTC) as the reference point for the phase calculation.
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

/** The real current moon phase, purely computed (no API needed) - ties the app's moon branding to the actual sky. */
export function getMoonPhase(date: Date = new Date()): { emoji: string; name: string } {
  const diffDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86400000;
  let phase = diffDays % SYNODIC_MONTH_DAYS;
  if (phase < 0) phase += SYNODIC_MONTH_DAYS;
  const index = Math.round((phase / SYNODIC_MONTH_DAYS) * 8) % 8;
  return PHASES[index];
}
