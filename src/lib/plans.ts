import type { Plan, PlanState } from "./types";
import { daysUntil } from "./dates";

/** Derives the real-world state of a plan: upcoming, completed (linked to a memory), missed (past with no memory), or explicitly cancelled. */
export function getPlanState(plan: Plan): PlanState {
  if (plan.status === "cancelled") return "cancelled";
  if (plan.memory_id) return "completed";
  const remaining = daysUntil(plan.plan_date);
  if (remaining < 0) return "missed";
  return "upcoming";
}

export function formatTimeRange(startTime: string | null, endTime: string | null): string | null {
  if (!startTime) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return endTime ? `${fmt(startTime)} – ${fmt(endTime)}` : fmt(startTime);
}
