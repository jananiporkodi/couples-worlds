"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addBucketItem } from "@/app/(app)/bucket-list/actions";
import { BUCKET_CATEGORIES } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "+ add adventure"}
    </button>
  );
}

export default function AddBucketItemForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("travel");
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full sm:w-auto">
        + add new adventure
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addBucketItem(formData);
        formRef.current?.reset();
        setCategory("travel");
        setOpen(false);
      }}
      className="card-panel p-5 space-y-3"
    >
      <p className="font-hand text-2xl">Add a new adventure</p>
      <input name="title" placeholder="Watch sunrise from the beach" className="input-field" required />
      <textarea name="description" placeholder="Any details? (optional)" className="input-field" rows={2} />

      <div className="grid grid-cols-2 gap-3">
        <select
          name="category"
          className="input-field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {BUCKET_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.emoji} {c.label}
            </option>
          ))}
          <option value="__custom__">✏️ custom category…</option>
        </select>

        <select name="priority" defaultValue="medium" className="input-field">
          <option value="low">low priority</option>
          <option value="medium">medium priority</option>
          <option value="high">high priority</option>
        </select>
      </div>

      {category === "__custom__" && (
        <input name="customCategoryName" placeholder="Name your category" className="input-field" />
      )}

      <div className="flex gap-2 pt-1">
        <SubmitButton />
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          cancel
        </button>
      </div>
    </form>
  );
}
