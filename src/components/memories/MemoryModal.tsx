"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BucketItem, Memory, Place, Plan } from "@/lib/types";
import { REACTION_EMOJIS } from "@/lib/types";
import { formatFriendlyDate } from "@/lib/dates";
import { reactToMemory, toggleMemoryFavorite } from "@/app/(app)/memories/actions";
import EditMemoryForm from "./EditMemoryForm";

export default function MemoryModal({
  memory,
  plans,
  bucketItems,
  places,
  partnerNames,
  onClose,
}: {
  memory: Memory;
  plans: Plan[];
  bucketItems: BucketItem[];
  places: Place[];
  partnerNames: { a: string; b: string };
  onClose: () => void;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [enlarged, setEnlarged] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const photos = memory.photos ?? [];
  const relatedPlan = plans.find((p) => p.memory_id === memory.id);
  const relatedBucketItem = bucketItems.find((b) => b.id === memory.bucket_item_id);
  const relatedPlace = places.find((p) => p.id === memory.place_id);

  function next() {
    setPhotoIndex((i) => (i + 1) % photos.length);
  }
  function prev() {
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    setTouchStartX(null);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-paper dark:bg-paper-dark rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-black/50 flex items-center justify-center text-sm shadow"
          aria-label="Close"
        >
          ✕
        </button>

        {editing ? (
          <div className="p-5">
            <EditMemoryForm memory={memory} places={places} partnerNames={partnerNames} onDone={() => setEditing(false)} />
          </div>
        ) : (
          <>
            {photos.length > 0 && (
              <div
                className="relative w-full aspect-[4/3] bg-black"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button className="absolute inset-0" onClick={() => setEnlarged(true)} aria-label="Enlarge photo">
                  <Image src={photos[photoIndex]} alt={memory.title ?? ""} fill sizes="768px" className="object-contain" />
                </button>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
                    >
                      ‹
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
                    >
                      ›
                    </button>
                    <span className="absolute bottom-2 right-2 text-[11px] font-bold bg-black/55 text-white px-2 py-0.5 rounded-full">
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>
            )}

            {photos.length > 1 && (
              <div className="flex gap-1.5 p-2.5 overflow-x-auto">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setPhotoIndex(i)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      i === photoIndex ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <Image src={url} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="p-5 pt-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    {memory.location ? `📍 ${memory.location} · ` : ""}
                    {formatFriendlyDate(memory.memory_date)}
                  </p>
                  {memory.title && <p className="font-hand text-3xl mt-1 leading-tight">{memory.title}</p>}
                </div>
                <button
                  disabled={pending}
                  onClick={() => startTransition(() => toggleMemoryFavorite(memory.id, !memory.is_favorite))}
                  className="text-2xl flex-shrink-0"
                  aria-label="Toggle favorite"
                >
                  {memory.is_favorite ? "♥" : "♡"}
                </button>
              </div>

              {memory.story && <p className="font-patrick text-lg text-ink mt-3 leading-snug whitespace-pre-wrap">{memory.story}</p>}

              {memory.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {memory.tags.map((tag) => (
                    <span key={tag} className="chip bg-lavender text-bezel text-[11px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {(memory.note_a || memory.note_b) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                  {memory.note_a && (
                    <div className="card-panel p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">
                        {partnerNames.a}
                      </p>
                      <p className="text-sm text-ink-soft">{memory.note_a}</p>
                    </div>
                  )}
                  {memory.note_b && (
                    <div className="card-panel p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft mb-1">
                        {partnerNames.b}
                      </p>
                      <p className="text-sm text-ink-soft">{memory.note_b}</p>
                    </div>
                  )}
                </div>
              )}

              {(relatedPlan || relatedBucketItem || relatedPlace) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {relatedPlan && (
                    <span className="chip bg-blush text-accent text-[11px]">🗓 from plan: {relatedPlan.title}</span>
                  )}
                  {relatedBucketItem && (
                    <span className="chip bg-blush text-accent text-[11px]">🪣 {relatedBucketItem.title}</span>
                  )}
                  {relatedPlace && (
                    <Link href={`/places?place=${relatedPlace.id}`} className="chip bg-blush text-accent text-[11px]">
                      📍 {relatedPlace.name}
                    </Link>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    disabled={pending}
                    onClick={() => startTransition(() => reactToMemory(memory.id, emoji))}
                    className="text-xs bg-cream dark:bg-white/5 px-2.5 py-1 rounded-full hover:scale-105 transition"
                  >
                    {emoji} {memory.reactions?.[emoji] ?? 0}
                  </button>
                ))}
              </div>

              <button onClick={() => setEditing(true)} className="btn-ghost !py-2 !px-4 text-sm mt-4">
                edit memory
              </button>
            </div>
          </>
        )}

        <AnimatePresence>
          {enlarged && photos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
              onClick={() => setEnlarged(false)}
            >
              <div className="relative w-full h-full max-w-4xl">
                <Image src={photos[photoIndex]} alt="" fill sizes="100vw" className="object-contain" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
