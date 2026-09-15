"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ActivityItem } from "@/lib/activity-meta";
import { activityMeta } from "@/lib/activity-meta";

const LAST_SEEN_KEY = "olw-notifications-last-seen";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsBell({ items }: { items: ActivityItem[] }) {
  const [open, setOpen] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const newestCreatedAt = items[0]?.createdAt;

  useEffect(() => {
    if (!newestCreatedAt) {
      setHasUnseen(false);
      return;
    }
    let lastSeen: string | null = null;
    try {
      lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    } catch {}
    setHasUnseen(!lastSeen || new Date(newestCreatedAt).getTime() > new Date(lastSeen).getTime());
  }, [newestCreatedAt]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setHasUnseen(false);
      try {
        localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      } catch {}
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label="Recent activity"
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-sm shadow-sm border border-black/[0.06] dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/5 transition"
      >
        <span className="text-lg">🔔</span>
        {hasUnseen && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-paper dark:ring-paper-dark animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 card-panel p-2 z-50 max-h-96 overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft px-2 py-1.5">Recent activity</p>
            {items.length === 0 && <p className="text-xs text-ink-soft px-2 py-2">Nothing yet — add a memory, plan, or note to see it here.</p>}
            {items.map((item) => {
              const meta = activityMeta(item.kind);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex gap-2 items-start px-2 py-2 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/5 transition"
                >
                  <span className="text-base leading-none mt-0.5">{meta.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-semibold truncate">{item.title || "Untitled"}</span>
                    <span className="block text-[11px] text-ink-soft">
                      {meta.verb} · {timeAgo(item.createdAt)}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
