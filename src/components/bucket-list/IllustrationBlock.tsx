"use client";

import { useState } from "react";
import Image from "next/image";
import { setIllustrationUrl } from "@/app/(app)/bucket-list/actions";
import { BUCKET_CATEGORIES } from "@/lib/types";

export default function IllustrationBlock({
  itemId,
  illustrationUrl,
  illustrationPrompt,
  category,
}: {
  itemId: string;
  illustrationUrl: string | null;
  illustrationPrompt: string | null;
  category: string;
}) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  if (illustrationUrl) {
    return (
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-black/5">
        <Image src={illustrationUrl} alt="" fill sizes="56px" className="object-cover" />
      </div>
    );
  }

  const categoryMeta = BUCKET_CATEGORIES.find((c) => c.key === category);
  const emoji = categoryMeta?.emoji ?? "🎨";

  return (
    <div className="flex-shrink-0 relative">
      <button
        type="button"
        onClick={() => setShowPrompt((s) => !s)}
        className="w-14 h-14 rounded-xl bg-lavender/60 dark:bg-lavender-deep/20 flex items-center justify-center text-2xl"
        title="No illustration yet — click for options"
      >
        {emoji}
      </button>
      {showPrompt && illustrationPrompt && (
        <div className="absolute z-10 mt-2 w-72 card-panel p-3 text-xs">
          <p className="text-ink-soft mb-2">{illustrationPrompt}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-ghost !py-1 !px-2 text-[11px]"
              onClick={async () => {
                await navigator.clipboard.writeText(illustrationPrompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "copied ✓" : "copy prompt"}
            </button>
          </div>
          <form
            action={async (formData) => {
              formData.set("itemId", itemId);
              await setIllustrationUrl(formData);
              setShowPrompt(false);
            }}
            className="flex gap-1.5 mt-2"
          >
            <input name="illustrationUrl" placeholder="paste generated image URL" className="input-field !py-1.5 text-[11px]" />
            <button type="submit" className="btn-ghost !py-1.5 !px-2 text-[11px]">save</button>
          </form>
        </div>
      )}
    </div>
  );
}
