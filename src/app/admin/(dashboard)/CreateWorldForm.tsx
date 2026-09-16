"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createWorld, CreateWorldState } from "./actions";

const initialState: CreateWorldState = {};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Creating…" : "Create world"}
    </button>
  );
}

export default function CreateWorldForm() {
  const [state, formAction] = useFormState(createWorld, initialState);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">Couple name</label>
        <input
          type="text"
          name="name"
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Alex & Sam"
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          URL slug — /w/{slug || "…"}
        </label>
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="alex-and-sam"
          className="input-field"
          required
        />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-ink-soft">Passcode</label>
        <input type="text" name="passcode" placeholder="their shared passcode" className="input-field" required />
      </div>
      {state?.error ? <p className="text-xs text-accent font-semibold">{state.error}</p> : null}
      {state?.success ? <p className="text-xs text-ink font-semibold">{state.success} ✓</p> : null}
      <SubmitButton />
    </form>
  );
}
