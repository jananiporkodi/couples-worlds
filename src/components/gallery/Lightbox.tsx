"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryMedia } from "@/lib/types";
import { updateGalleryPhoto, deleteGalleryPhoto } from "@/app/(app)/gallery/actions";

const PERSON_OPTIONS = [
  { key: "us", label: "us" },
  { key: "him", label: "him" },
  { key: "her", label: "her" },
] as const;

function EditForm({ item, onDone }: { item: GalleryMedia; onDone: () => void }) {
  const [caption, setCaption] = useState(item.caption ?? "");
  const [person, setPerson] = useState<(typeof PERSON_OPTIONS)[number]["key"]>(
    (item.person as (typeof PERSON_OPTIONS)[number]["key"]) || "us"
  );
  const [favorite, setFavorite] = useState(item.is_favorite);
  const [tags, setTags] = useState((item.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("caption", caption);
    formData.set("person", person);
    formData.set("tags", tags);
    if (favorite) formData.set("favorite", "on");
    await updateGalleryPhoto(formData);
    setSaving(false);
    onDone();
  }

  async function remove() {
    if (!confirm("Delete this photo?")) return;
    setSaving(true);
    await deleteGalleryPhoto(item.id);
    setSaving(false);
    onDone();
  }

  return (
    <div className="mt-3 space-y-2.5 bg-paper dark:bg-paper-dark rounded-xl p-3">
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="caption"
        className="input-field !py-1.5 text-sm"
      />
      <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" className="input-field !py-1.5 text-sm" />
      <div>
        <p className="text-[11px] text-ink-soft mb-1">who&apos;s this for?</p>
        <div className="flex gap-1.5">
          {PERSON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPerson(opt.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                person === opt.key ? "bg-bezel text-white" : "bg-black/[0.04] dark:bg-white/10 text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} className="accent-accent" />
        our favorites
      </label>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={save} disabled={saving} className="btn-primary !py-1.5 !px-3 text-xs">
          {saving ? "saving…" : "save"}
        </button>
        <button type="button" onClick={onDone} disabled={saving} className="btn-ghost !py-1.5 !px-3 text-xs">
          cancel
        </button>
        <button type="button" onClick={remove} disabled={saving} className="btn-ghost !py-1.5 !px-3 text-xs text-accent ml-auto">
          delete
        </button>
      </div>
    </div>
  );
}

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
  const [editing, setEditing] = useState(false);
  const item = index !== null ? items[index] : null;

  function close() {
    setEditing(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative max-w-[280px] sm:max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-black">
              <Image src={item.url} alt={item.caption ?? ""} fill sizes="320px" className="object-contain" />
            </div>
            {item.caption && !editing && <p className="text-white/90 text-center mt-3 font-hand text-lg">{item.caption}</p>}
            {item.memory_id && (
              <div className="text-center mt-1.5">
                <Link href={`/memories?open=${item.memory_id}`} className="text-xs text-white/80 underline underline-offset-2">
                  view memory
                </Link>
              </div>
            )}
            {!item.memory_id && !editing && (
              <div className="text-center mt-1.5">
                <button onClick={() => setEditing(true)} className="text-xs text-white/80 underline underline-offset-2">
                  edit
                </button>
              </div>
            )}
            {!item.memory_id && editing && <EditForm item={item} onDone={() => setEditing(false)} />}

            <button
              onClick={close}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-bezel flex items-center justify-center text-sm shadow"
              aria-label="Close"
            >
              ✕
            </button>
            {!editing && index > 0 && (
              <button
                onClick={() => onNavigate(index - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center"
                aria-label="Previous"
              >
                ‹
              </button>
            )}
            {!editing && index < items.length - 1 && (
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
