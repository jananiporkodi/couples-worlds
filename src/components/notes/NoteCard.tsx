"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { motion } from "framer-motion";
import type { Note } from "@/lib/types";
import NoteModal from "./NoteModal";
import NoteDoodle from "./NoteDoodles";
import { playPaperSound } from "@/lib/paperSound";
import { styleForId } from "@/lib/noteStyles";
import { toggleNotePin } from "@/app/(app)/notes/actions";

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
}

export default function NoteCard({ note }: { note: Note }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const style = styleForId(note.id);

  function handleOpen() {
    playPaperSound();
    setOpen(true);
  }

  function handlePinToggle(e: MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      await toggleNotePin(note.id, !note.pinned);
    });
  }

  return (
    <>
      <motion.div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.97 }}
        style={{
          backgroundColor: style.bg,
          backgroundImage: `repeating-linear-gradient(${style.bg} 0px, ${style.bg} 25px, ${style.lineColor} 26px)`,
        }}
        className={`relative w-full aspect-square p-2.5 pt-4 flex flex-col text-left cursor-pointer shadow-[0_3px_10px_rgba(20,20,20,0.08)] ${style.borderClass}`}
      >
        <NoteDoodle variant={style.doodle} size={0.65} />

        <button
          onClick={handlePinToggle}
          disabled={pending}
          title={note.pinned ? "Unpin from the wall" : "Pin to the wall"}
          className="absolute top-1.5 left-1.5 w-5 h-5 flex items-center justify-center text-xs z-10"
        >
          {note.pinned ? "📌" : <span className="opacity-30 hover:opacity-70 transition">📌</span>}
        </button>

        <p className="font-patrick text-sm text-ink leading-[20px] line-clamp-3 whitespace-pre-wrap flex-1">
          {note.body}
        </p>

        <div className="flex justify-between items-center pt-1 text-[9px] text-ink-soft/80">
          <span>{note.author ? `— ${note.author}` : "— us"}</span>
          <span>
            {timeAgo(note.created_at)} {note.mood ? `· ${note.mood}` : ""}
          </span>
        </div>
      </motion.div>

      {open && <NoteModal note={note} onClose={() => setOpen(false)} />}
    </>
  );
}
