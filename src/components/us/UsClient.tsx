"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import StatTile from "./StatTile";
import { daysBetween, dayOfYearIndex } from "@/lib/dates";
import Link from "next/link";
import { addLoveJarEntry } from "@/app/(app)/us/actions";
import type { LoveJarEntry } from "@/lib/types";
import type { AutoCountdown } from "@/lib/data";

interface Stats {
  bucketTotal: number;
  bucketCompleted: number;
  memoriesCount: number;
  photosCount: number;
  notesCount: number;
  countriesCount: number;
}

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-ghost !text-xs" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function UsClient({
  stats,
  settings,
  loveJar,
  autoCountdowns,
}: {
  stats: Stats;
  settings: Record<string, unknown>;
  loveJar: LoveJarEntry[];
  autoCountdowns: AutoCountdown[];
}) {
  const startDate = settings.relationship_start_date as string | undefined;
  const days = startDate ? daysBetween(startDate) : null;
  const missingBirthdays = !settings.partner_a_birthday || !settings.partner_b_birthday;

  const loveJarFormRef = useRef<HTMLFormElement>(null);

  const facts = [
    stats.bucketTotal > 0
      ? `you've completed ${stats.bucketCompleted} of ${stats.bucketTotal} bucket list items 🪣`
      : "add your first bucket list item to start tracking progress 🪣",
    `you've saved ${stats.photosCount} photos together so far 📸`,
    `you've written ${stats.notesCount} little notes to each other 💌`,
    stats.countriesCount > 0
      ? `you've made memories in ${stats.countriesCount} countries so far 🌍`
      : "tag a memory with a country to start tracking your travels 🌍",
  ];
  const fact = facts[dayOfYearIndex(facts.length)];

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Us ❤️</p>
      <p className="text-sm text-ink-soft mb-6">a little dashboard of everything we&apos;re building</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile value={days ?? "—"} label="days together" colorClass="bg-peach" />
        <StatTile value={`${stats.bucketCompleted}/${stats.bucketTotal}`} label="bucket list done" colorClass="bg-sage" />
        <StatTile value={stats.memoriesCount} label="memories saved" colorClass="bg-lavender" />
        <StatTile value={stats.photosCount} label="photos saved" colorClass="bg-blush" />
      </div>

      <div className="card-panel p-4 mb-8">
        <p className="text-xs italic text-ink-soft">
          <span className="font-bold not-italic text-ink">Did you know? </span>
          {fact}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card-panel p-5">
          <p className="font-hand text-2xl mb-3">Countdowns ⏳</p>
          <ul className="space-y-2 mb-3">
            {autoCountdowns.length === 0 && (
              <li className="text-sm text-ink-soft">
                Add your relationship start date and birthdays in{" "}
                <Link href="/settings" className="text-accent underline">
                  Settings
                </Link>{" "}
                to see countdowns here.
              </li>
            )}
            {autoCountdowns.map((c) => (
              <li key={c.key} className="flex justify-between text-sm">
                <span>
                  {c.emoji} {c.title}
                </span>
                <span className="font-bold text-ink-soft">{c.daysRemaining === 0 ? "today!" : `${c.daysRemaining}d`}</span>
              </li>
            ))}
          </ul>
          {missingBirthdays && autoCountdowns.length > 0 && (
            <p className="text-[11px] text-ink-soft">
              Add both birthdays in{" "}
              <Link href="/settings" className="text-accent underline">
                Settings
              </Link>{" "}
              to see them here too.
            </p>
          )}
        </section>

        <section className="card-panel p-5">
          <p className="font-hand text-2xl mb-3">Love jar 🫙</p>
          <ul className="space-y-1.5 mb-3 max-h-40 overflow-y-auto pr-1">
            {loveJar.length === 0 && <li className="text-sm text-ink-soft">Empty for now — add a tiny moment.</li>}
            {loveJar.map((entry) => (
              <li key={entry.id} className="text-sm text-ink-soft italic">
                &ldquo;{entry.body}&rdquo; {entry.author ? `— ${entry.author}` : ""}
              </li>
            ))}
          </ul>
          <form
            ref={loveJarFormRef}
            action={async (formData) => {
              await addLoveJarEntry(formData);
              loveJarFormRef.current?.reset();
            }}
            className="flex flex-wrap gap-1.5"
          >
            <input name="body" placeholder="You held my hand crossing the road." className="input-field flex-1 !py-1.5 text-xs" required />
            <input name="author" placeholder="from" className="input-field !w-20 !py-1.5 text-xs" />
            <Submit label="add" pendingLabel="adding…" />
          </form>
        </section>
      </div>
    </div>
  );
}
