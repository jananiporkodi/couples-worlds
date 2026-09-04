"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addMemory } from "@/app/(app)/memories/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Saving…" : "save memory"}
    </button>
  );
}

export default function AddMemoryForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
        + add a memory
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addMemory(formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="card-panel p-5 space-y-3"
    >
      <p className="font-hand text-2xl">Add a memory</p>
      <input name="title" placeholder="Title (optional)" className="input-field" />
      <textarea name="story" placeholder="Tell the story…" className="input-field" rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" name="memoryDate" className="input-field" defaultValue={new Date().toISOString().slice(0, 10)} />
        <input name="location" placeholder="Location (optional)" className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select name="mood" className="input-field" defaultValue="">
          <option value="">mood (optional)</option>
          <option value="😍">😍 loved it</option>
          <option value="🥹">🥹 emotional</option>
          <option value="😂">😂 fun</option>
          <option value="🥰">🥰 sweet</option>
        </select>
        <input name="tags" placeholder="tags, comma, separated" className="input-field" />
      </div>
      <input type="file" name="photos" accept="image/*,video/*" multiple className="input-field !py-2 text-xs" />
      <div className="flex gap-2 pt-1">
        <SubmitButton />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          cancel
        </button>
      </div>
    </form>
  );
}
