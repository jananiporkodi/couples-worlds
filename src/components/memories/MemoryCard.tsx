"use client";

import Image from "next/image";
import type { Memory } from "@/lib/types";
import { formatFriendlyDate } from "@/lib/dates";

export default function MemoryCard({ memory, onOpen }: { memory: Memory; onOpen: () => void }) {
  const cover = memory.photos?.[0] ?? null;
  const extraCount = (memory.photos?.length ?? 0) - 1;
  const totalReactions = Object.values(memory.reactions ?? {}).reduce((a, b) => a + b, 0);

  return (
    <button onClick={onOpen} className="card-panel p-4 text-left w-full hover:-translate-y-0.5 transition relative">
      {memory.is_favorite && <span className="absolute top-3 right-3 text-accent text-lg">♥</span>}
      {cover && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-black/5">
          <Image src={cover} alt={memory.title ?? ""} fill sizes="400px" className="object-cover" />
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/55 text-white px-2 py-0.5 rounded-full">
              +{extraCount}
            </span>
          )}
        </div>
      )}
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
        {memory.location ? `📍 ${memory.location} · ` : ""}
        {formatFriendlyDate(memory.memory_date)}
      </p>
      {memory.title && <p className="font-hand text-2xl mt-1 leading-tight">{memory.title}</p>}
      {memory.story && (
        <p className="text-sm text-ink-soft mt-1 leading-snug line-clamp-3">
          {memory.story}
          {memory.story.length > 140 ? "…" : ""}
        </p>
      )}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex flex-wrap gap-1.5">
          {memory.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-ink-soft">
              #{tag}
            </span>
          ))}
        </div>
        {totalReactions > 0 && <span className="text-[11px] text-ink-soft">{totalReactions} reactions</span>}
      </div>
    </button>
  );
}
