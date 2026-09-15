"use client";

import { useState, useTransition } from "react";
import { sendKiss } from "@/app/(app)/home-actions";

export default function KissButton({ receivedCount = 0 }: { receivedCount?: number }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const { sent } = await sendKiss();
      setFeedback(sent ? "sent! 💕" : "pick who you are in Settings first");
      setTimeout(() => setFeedback(null), 2200);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={pending}
        aria-label="Send a kiss"
        title={receivedCount > 0 ? `Send a kiss · ${receivedCount} received` : "Send a kiss"}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-sm shadow-sm border border-black/[0.06] dark:border-white/10 hover:scale-110 transition text-base"
      >
        💋
      </button>
      {receivedCount > 0 && (
        <span
          className="absolute -bottom-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shadow-sm"
          aria-label={`${receivedCount} kisses received`}
        >
          {receivedCount > 99 ? "99+" : receivedCount}
        </span>
      )}
      {feedback && (
        <span className="absolute top-full right-0 mt-1.5 text-[11px] font-bold text-accent whitespace-nowrap bg-paper dark:bg-paper-dark px-2 py-1 rounded-full shadow-sm animate-bounce">
          {feedback}
        </span>
      )}
    </div>
  );
}
