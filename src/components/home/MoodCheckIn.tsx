"use client";

import { useState, useTransition } from "react";
import { setTodayMood } from "@/app/(app)/home-actions";

const MOOD_OPTIONS = ["😊", "🥰", "😴", "😢", "😤", "🤒", "🥳", "😌"];

export default function MoodCheckIn({
  names,
  todayMoods,
  currentPartner,
}: {
  names: { a: string; b: string };
  todayMoods: { a: string | null; b: string | null };
  currentPartner: "partner_a" | "partner_b" | null;
}) {
  const [pending, startTransition] = useTransition();
  const [myMoodOverride, setMyMoodOverride] = useState<string | null>(null);

  const savedMyMood = currentPartner === "partner_a" ? todayMoods.a : currentPartner === "partner_b" ? todayMoods.b : null;
  const myMood = myMoodOverride ?? savedMyMood;
  const otherMood = currentPartner === "partner_a" ? todayMoods.b : currentPartner === "partner_b" ? todayMoods.a : null;
  const myName = currentPartner === "partner_a" ? names.a : names.b;
  const otherName = currentPartner === "partner_a" ? names.b : names.a;

  function pick(mood: string) {
    if (!currentPartner) return;
    setMyMoodOverride(mood);
    startTransition(() => {
      setTodayMood(mood);
    });
  }

  return (
    <div className="card-panel p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-3">How are you feeling today?</p>
      {!currentPartner ? (
        <p className="text-sm text-ink-soft">
          Pick who you are in Settings to start a daily check-in.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => pick(m)}
                disabled={pending}
                aria-label={`Feeling ${m}`}
                className={`text-xl w-9 h-9 rounded-full flex items-center justify-center transition ${
                  myMood === m ? "bg-peach scale-110" : "bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span>
              {myName}: <span className="font-bold">{myMood ?? "—"}</span>
            </span>
            <span>
              {otherName}: <span className="font-bold">{otherMood ?? "—"}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
