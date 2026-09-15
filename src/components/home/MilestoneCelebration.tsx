"use client";

import { useEffect, useState } from "react";
import HeartBurst from "./HeartBurst";

/** Round-number days-together milestones worth celebrating: every 100 days, and every year (365-day multiples). */
function isMilestone(days: number): boolean {
  if (days <= 0) return false;
  return days % 100 === 0 || days % 365 === 0;
}

/**
 * Fires a one-time heart-burst the first time either partner opens the app on a milestone day.
 * Uses localStorage (keyed by the exact day count) so it doesn't replay on every reload/navigation
 * for the rest of that day.
 */
export default function MilestoneCelebration({ days }: { days: number | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (days === null || !isMilestone(days)) return;
    const key = `olw-milestone-seen-${days}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      // If localStorage isn't available, just skip the celebration rather than replaying it forever.
      return;
    }
    setShow(true);
    const timer = setTimeout(() => setShow(false), 3800);
    return () => clearTimeout(timer);
  }, [days]);

  if (!show) return null;
  return <HeartBurst />;
}
