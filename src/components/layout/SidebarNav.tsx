"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import MoonMark from "./MoonMark";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-black/[0.06] dark:border-white/5 bg-paper/80 dark:bg-paper-dark/70 backdrop-blur-sm p-5">
      <div className="flex items-center mb-8 px-2">
        <p className="font-hand text-2xl flex items-center gap-2">
          <MoonMark className="w-5 h-5 text-accent" />
          Our Little World
        </p>
      </div>
      <nav className="flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-peach text-accent dark:bg-peach-deep/40 dark:text-white"
                  : "text-ink-soft hover:bg-black/[0.03] dark:hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 px-2 pt-6">
        <Link href="/settings" className="text-[11px] text-ink-soft hover:text-ink underline underline-offset-2 block">
          settings
        </Link>
        <form action="/api/logout" method="POST">
          <button type="submit" className="text-[11px] text-ink-soft hover:text-ink underline underline-offset-2">
            lock this world
          </button>
        </form>
        <span className="text-[11px] text-ink-soft block">made with love</span>
      </div>
    </aside>
  );
}
