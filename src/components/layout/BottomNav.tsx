"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, BOTTOM_NAV_PRIMARY } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = NAV_ITEMS.filter((item) => BOTTOM_NAV_PRIMARY.includes(item.href));
  const overflowItems = NAV_ITEMS.filter((item) => !BOTTOM_NAV_PRIMARY.includes(item.href));

  return (
    <>
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-paper dark:bg-paper-dark rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] grid grid-cols-4 gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {overflowItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-1 text-[11px] font-semibold text-ink-soft"
              >
                <span className="text-xl">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-1 text-[11px] font-semibold text-ink-soft"
            >
              <span className="text-xl">⚙️</span>
              Settings
            </Link>
          </div>
        </div>
      )}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around items-center bg-white/90 dark:bg-paper-dark/90 backdrop-blur-sm border-t border-black/[0.06] dark:border-white/5 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {primaryItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 text-[10px] font-semibold transition ${
                active ? "bg-peach text-accent" : "text-ink-soft"
              }`}
            >
              <span className="text-lg leading-none mb-0.5">{item.emoji}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 text-[10px] font-semibold text-ink-soft"
        >
          <span className="text-lg leading-none mb-0.5">⋯</span>
        </button>
      </nav>
    </>
  );
}
