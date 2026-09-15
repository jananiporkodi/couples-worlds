"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/lib/types";
import NoteModal from "./NoteModal";
import { playPaperSound } from "@/lib/paperSound";

const SCRAP_POSITIONS = [
  { left: "32%", top: "52%" },
  { left: "56%", top: "46%" },
  { left: "44%", top: "66%" },
  { left: "64%", top: "60%" },
  { left: "36%", top: "76%" },
  { left: "58%", top: "78%" },
  { left: "48%", top: "56%" },
  { left: "68%", top: "70%" },
];

export default function LoveJarPicker({ notes }: { notes: Note[] }) {
  const [shaking, setShaking] = useState(false);
  const [picked, setPicked] = useState<Note | null>(null);

  const scraps = SCRAP_POSITIONS.slice(0, Math.min(notes.length, SCRAP_POSITIONS.length));

  function handlePick() {
    if (notes.length === 0 || shaking) return;
    setShaking(true);
    setTimeout(() => {
      const random = notes[Math.floor(Math.random() * notes.length)];
      playPaperSound();
      setPicked(random);
      setShaking(false);
    }, 550);
  }

  return (
    <div className="flex flex-col items-center py-8">
      <p className="font-hand text-2xl mb-1">reach in and pick one</p>
      <p className="text-xs text-ink-soft mb-6">{notes.length} note{notes.length === 1 ? "" : "s"} in the jar</p>

      <motion.div
        className="relative w-44 h-56 md:w-52 md:h-64"
        animate={shaking ? { rotate: [0, -6, 6, -4, 4, -2, 2, 0], x: [0, -3, 3, -2, 2, 0] } : { rotate: 0, x: 0 }}
        transition={{ duration: 0.55 }}
      >
        <svg viewBox="0 0 200 240" className="w-full h-full">
          <rect x="65" y="8" width="70" height="16" rx="4" fill="#D9A054" stroke="#8a6239" strokeWidth="2" />
          <rect x="70" y="22" width="60" height="10" rx="3" fill="#C99A63" stroke="#8a6239" strokeWidth="2" />
          <path
            d="M55 38 Q50 38 50 48 L45 198 Q45 224 72 224 L128 224 Q155 224 155 198 L150 48 Q150 38 145 38 Z"
            fill="rgba(200,225,245,0.18)"
            stroke="#8FC1E8"
            strokeWidth="3"
          />
          <line x1="52" y1="44" x2="148" y2="44" stroke="#8FC1E8" strokeWidth="2" opacity="0.5" />
          <line x1="50" y1="51" x2="150" y2="51" stroke="#8FC1E8" strokeWidth="2" opacity="0.5" />
        </svg>

        {scraps.map((pos, i) => (
          <motion.span
            key={i}
            className="absolute text-lg -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos.left, top: pos.top }}
            animate={{ y: [0, -4, 0], rotate: [-4, 4, -4] }}
            transition={{ duration: 2.4 + (i % 3) * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          >
            💌
          </motion.span>
        ))}
      </motion.div>

      <button onClick={handlePick} disabled={notes.length === 0 || shaking} className="btn-secondary mt-5">
        {notes.length === 0 ? "the jar is empty" : shaking ? "picking…" : "🤞 pick one"}
      </button>
      {notes.length === 0 && <p className="text-xs text-ink-soft mt-2">write a note first, then come shake the jar</p>}

      {picked && <NoteModal note={picked} onClose={() => setPicked(null)} />}
    </div>
  );
}
