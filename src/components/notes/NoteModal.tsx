"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Note } from "@/lib/types";
import { styleForId } from "@/lib/noteStyles";
import NoteDoodle from "./NoteDoodles";
import { toggleNotePin } from "@/app/(app)/notes/actions";

function fullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default function NoteModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const style = styleForId(note.id);
  const [pinned, setPinned] = useState(note.pinned);
  const [pending, startTransition] = useTransition();

  function handlePinToggle() {
    const next = !pinned;
    setPinned(next);
    startTransition(async () => {
      await toggleNotePin(note.id, next);
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`w-full max-w-md max-h-[85vh] overflow-y-auto p-7 pt-9 shadow-2xl relative ${style.borderClass}`}
          style={{
            backgroundColor: style.bg,
            backgroundImage: `repeating-linear-gradient(${style.bg} 0px, ${style.bg} 27px, ${style.lineColor} 28px)`,
            transformOrigin: "top center",
          }}
          initial={{ scaleY: 0.05, rotateX: -80, opacity: 0, rotate: 0 }}
          animate={{ scaleY: 1, rotateX: 0, opacity: 1, rotate: -0.6 }}
          exit={{ scaleY: 0.05, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <NoteDoodle variant={style.doodle} />

          <button
            onClick={handlePinToggle}
            disabled={pending}
            title={pinned ? "Unpin from the wall" : "Pin to the wall"}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-sm shadow"
          >
            {pinned ? "📌" : <span className="opacity-40">📌</span>}
          </button>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-sm shadow"
            aria-label="Close"
          >
            ✕
          </button>
          <p className="font-patrick text-lg text-ink leading-[28px] whitespace-pre-wrap pr-8 pt-1">{note.body}</p>
          <div className="flex justify-between items-center mt-3 text-[11px] text-ink-soft">
            <span>{note.author ? `— ${note.author}` : "— us"}</span>
            <span>
              {fullDate(note.created_at)} {note.mood ? `· ${note.mood}` : ""}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
