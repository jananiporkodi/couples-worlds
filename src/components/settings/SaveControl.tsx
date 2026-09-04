"use client";

import { useFormStatus } from "react-dom";

/** Thin-line check icon - deliberately no filled background/container. */
export function SaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Lightweight save action for settings forms: a thin icon + label, no button background/pill. */
export function SaveButton({ label = "save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-white hover:text-accent transition disabled:opacity-50"
    >
      <SaveIcon />
      {pending ? "Saving…" : label}
    </button>
  );
}

/** Small confirmation that fades in then back out after a save completes. */
export function SavedConfirmation({ show }: { show: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold text-accent transition-opacity duration-700 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <SaveIcon className="w-3.5 h-3.5" />
      Saved
    </span>
  );
}
