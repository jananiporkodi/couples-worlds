"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addTimelineEvent } from "@/app/(app)/timeline/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "+ add milestone"}
    </button>
  );
}

export default function AddTimelineEventForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
        + add a milestone
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addTimelineEvent(formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="card-panel p-5 space-y-3"
    >
      <p className="font-hand text-2xl">Add a milestone</p>
      <input name="title" placeholder="First date" className="input-field" required />
      <textarea name="description" placeholder="What happened? (optional)" className="input-field" rows={2} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" name="eventDate" className="input-field" required />
        <select name="mood" className="input-field" defaultValue="">
          <option value="">mood (optional)</option>
          <option value="😍">😍</option>
          <option value="🥹">🥹</option>
          <option value="🥰">🥰</option>
          <option value="🎉">🎉</option>
        </select>
      </div>
      <input type="file" name="photos" accept="image/*" multiple className="input-field !py-2 text-xs" />
      <div className="flex gap-2 pt-1">
        <SubmitButton />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          cancel
        </button>
      </div>
    </form>
  );
}
