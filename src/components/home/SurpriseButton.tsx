"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { getSurprise } from "@/app/(app)/home-actions";
import { formatFriendlyDate } from "@/lib/dates";

type Surprise = Awaited<ReturnType<typeof getSurprise>>;

export default function SurpriseButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Surprise | null>(null);

  function handleClick() {
    startTransition(async () => {
      const data = await getSurprise();
      setResult(data);
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={pending}
        className="card-panel p-4 flex items-center gap-3 hover:-translate-y-0.5 transition text-left w-full"
      >
        <span className="text-2xl">🎁</span>
        <div>
          <p className="font-bold text-sm">{pending ? "Shuffling…" : "Surprise me"}</p>
          <p className="text-xs text-ink-soft">relive a random memory together</p>
        </div>
      </button>

      {result && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setResult(null)}>
          <div className="card-panel p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {result.memory ? (
              <>
                {result.memory.photo && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3 bg-black/5">
                    <Image src={result.memory.photo} alt={result.memory.title ?? ""} fill sizes="384px" className="object-contain" />
                  </div>
                )}
                <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                  {formatFriendlyDate(result.memory.date)}
                </p>
                {result.memory.title && <p className="font-hand text-2xl mt-1 leading-tight">{result.memory.title}</p>}
                {result.memory.story && (
                  <p className="text-sm text-ink-soft mt-1.5 whitespace-pre-wrap">{result.memory.story}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-ink-soft">No memories saved yet to surprise you with.</p>
            )}

            {result.note && (
              <div className="mt-4 pt-4 border-t border-dashed border-black/10 dark:border-white/10">
                <p className="text-sm italic text-ink-soft whitespace-pre-wrap">&ldquo;{result.note.body}&rdquo;</p>
                <p className="text-[11px] text-ink-soft mt-1">{result.note.author ? `— ${result.note.author}` : "— us"}</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={handleClick} disabled={pending} className="btn-ghost flex-1 justify-center text-xs">
                shuffle again
              </button>
              <button onClick={() => setResult(null)} className="btn-ghost flex-1 justify-center text-xs">
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
