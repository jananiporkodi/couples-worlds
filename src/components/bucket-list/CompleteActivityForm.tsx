"use client";

import { useRef, useState, useTransition } from "react";
import { completeBucketItem } from "@/app/(app)/bucket-list/actions";

export default function CompleteActivityForm({
  itemId,
  onDone,
}: {
  itemId: string;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await completeBucketItem(formData);
          onDone();
        });
      }}
      className="mt-3 space-y-2.5 border-t border-dashed border-black/10 dark:border-white/10 pt-3"
    >
      <input type="hidden" name="itemId" value={itemId} />
      <p className="font-hand text-xl">What made today memorable?</p>
      <textarea name="note" placeholder="Tell the story…" className="input-field" rows={2} required />
      <div className="grid grid-cols-2 gap-2">
        <select name="mood" className="input-field" defaultValue="">
          <option value="">mood (optional)</option>
          <option value="😍">😍 loved it</option>
          <option value="🥹">🥹 emotional</option>
          <option value="😂">😂 fun</option>
          <option value="🥰">🥰 sweet</option>
        </select>
        <input name="location" placeholder="location (optional)" className="input-field" />
      </div>
      <input type="file" name="photos" accept="image/*,video/*" multiple className="input-field !py-2 text-xs" />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary !py-2 !px-4 text-sm">
          {pending ? "Saving memory…" : "save as a memory"}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}
