import { dayOfYearIndex } from "./dates";

/**
 * Curated, rotating affirmation lines for the Home page. Some are templated with the
 * logged-in partner's name and/or their partner's name; plain ones work even when
 * identity isn't set up on this device yet. Deliberately curated, not AI-generated -
 * keeps the tone consistent and avoids anything cheesy or overwrought.
 */
const PLAIN_AFFIRMATIONS: string[] = [
  "Another day in your little world.",
  "You two make ordinary days worth remembering.",
  "Somewhere between all the little moments, you built a life together.",
  "Here's to another memory waiting to happen.",
  "Your favorite person is only one memory away.",
  "Little world, big love.",
  "Some of the best stories are still being written.",
];

function nameAffirmations(name: string): string[] {
  return [`Welcome back, ${name}.`, `Good to see you, ${name}.`];
}

function pairAffirmations(name: string, otherName: string): string[] {
  return [`${otherName} is lucky to have you, ${name}.`];
}

export function getAffirmationOfTheDay(
  partnerName: string | null,
  otherPartnerName: string | null,
  date: Date = new Date()
): string {
  const pool = [...PLAIN_AFFIRMATIONS];
  if (partnerName) pool.push(...nameAffirmations(partnerName));
  if (partnerName && otherPartnerName) pool.push(...pairAffirmations(partnerName, otherPartnerName));

  return pool[dayOfYearIndex(pool.length, date)];
}
