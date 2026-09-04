"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addNote } from "@/app/(app)/notes/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Writing…" : "✎ write a note"}
    </button>
  );
}

export default function AddNoteForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary w-full sm:w-auto">
        ✎ write a note
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addNote(formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="card-panel p-5 space-y-3"
    >
      <p className="font-hand text-2xl">A little note</p>
      <textarea name="body" placeholder="I loved today." className="input-field font-patrick text-base" rows={3} required />
      <div className="grid grid-cols-2 gap-3">
        <input name="author" placeholder="from... (optional)" className="input-field" />
        <select name="mood" className="input-field" defaultValue="">
          <option value="">mood (optional)</option>
          <option value="🥰">🥰</option>
          <option value="🥹">🥹</option>
          <option value="😊">😊</option>
          <option value="😴">😴</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <SubmitButton />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          cancel
        </button>
      </div>
    </form>
  );
}
