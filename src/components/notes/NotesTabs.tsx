"use client";

import { useState } from "react";
import type { Note } from "@/lib/types";
import NoteCard from "./NoteCard";
import LoveJarPicker from "./LoveJarPicker";

type Tab = "all" | "pinned" | "jar";

export default function NotesTabs({ notes }: { notes: Note[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const pinned = notes.filter((n) => n.pinned);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All notes" },
    { key: "pinned", label: `📌 Pinned Wall${pinned.length ? ` (${pinned.length})` : ""}` },
    { key: "jar", label: "🫙 The Jar" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              tab === t.key ? "bg-accent text-white" : "bg-black/[0.04] dark:bg-white/10 text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "all" &&
        (notes.length === 0 ? (
          <p className="text-sm text-ink-soft">No notes yet — write the first one.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        ))}

      {tab === "pinned" &&
        (pinned.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing pinned yet — tap 📌 on a note to add it to the wall.</p>
        ) : (
          <div
            className="rounded-3xl p-4 md:p-5 border border-black/[0.06]"
            style={{
              backgroundColor: "#E4C79C",
              backgroundImage:
                "radial-gradient(rgba(120,84,42,0.18) 1.2px, transparent 1.2px), radial-gradient(rgba(120,84,42,0.18) 1.2px, transparent 1.2px)",
              backgroundSize: "18px 18px",
              backgroundPosition: "0 0, 9px 9px",
            }}
          >
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pinned.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </div>
          </div>
        ))}

      {tab === "jar" && <LoveJarPicker notes={notes} />}
    </div>
  );
}
