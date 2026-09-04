/**
 * Types and display metadata for the notifications feed. Deliberately kept free of any
 * "server-only" imports (unlike src/lib/data.ts) so client components - like the
 * notifications bell - can import it directly without pulling server-only code into
 * the browser bundle.
 */
export interface ActivityItem {
  id: string;
  kind: "memory" | "plan" | "bucket" | "note";
  title: string;
  createdAt: string;
  href: string;
}

const ACTIVITY_META: Record<ActivityItem["kind"], { emoji: string; verb: string }> = {
  memory: { emoji: "📸", verb: "added a memory" },
  plan: { emoji: "🗓", verb: "planned something" },
  bucket: { emoji: "🪣", verb: "added to the bucket list" },
  note: { emoji: "💌", verb: "left a note" },
};

export function activityMeta(kind: ActivityItem["kind"]) {
  return ACTIVITY_META[kind];
}
