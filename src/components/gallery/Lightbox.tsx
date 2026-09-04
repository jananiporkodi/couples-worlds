"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryMedia } from "@/lib/types";

export default function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryMedia[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-black">
              <Image src={item.url} alt={item.caption ?? ""} fill sizes="600px" className="object-contain" />
            </div>
            {item.caption && <p className="text-white/90 text-center mt-3 font-hand text-xl">{item.caption}</p>}
            {item.memory_id && (
              <div className="text-center mt-1.5">
                <Link href={`/memories?open=${item.memory_id}`} className="text-xs text-white/80 underline underline-offset-2">
                  view memory
                </Link>
              </div>
            )}

            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-ink flex items-center justify-center text-sm shadow"
              aria-label="Close"
            >
              ✕
            </button>
            {index > 0 && (
              <button
                onClick={() => onNavigate(index - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            {index < items.length - 1 && (
              <button
                onClick={() => onNavigate(index + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
                aria-label="Next"
              >
                ›
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
