"use client";

import { motion } from "framer-motion";

const HEARTS = ["💕", "💖", "💗", "💓", "❤️", "💞"];

/** A gentle shower of floating hearts, used to celebrate round-number relationship milestones. */
export default function HeartBurst() {
  const pieces = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2.4 + Math.random() * 1.4;
        const emoji = HEARTS[i % HEARTS.length];
        const size = 16 + Math.random() * 22;
        const drift = Math.random() > 0.5 ? 24 : -24;

        return (
          <motion.span
            key={i}
            initial={{ y: "105vh", x: 0, opacity: 0 }}
            animate={{ y: "-10vh", x: drift, opacity: [0, 1, 1, 0] }}
            transition={{ duration, delay, ease: "easeOut" }}
            style={{ position: "absolute", left: `${left}%`, fontSize: size }}
          >
            {emoji}
          </motion.span>
        );
      })}
    </div>
  );
}
