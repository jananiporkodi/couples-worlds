"use client";

import { motion } from "framer-motion";

const SPARKLES = ["✦", "✧", "✦"];

export default function FloatingSparkles({ count = 3 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-base opacity-[0.12] text-ink select-none"
          style={{
            top: `${(i * 23 + 8) % 90}%`,
            left: `${(i * 37 + 5) % 92}%`,
          }}
          animate={{ y: [0, -14, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        >
          {SPARKLES[i % SPARKLES.length]}
        </motion.span>
      ))}
    </div>
  );
}
