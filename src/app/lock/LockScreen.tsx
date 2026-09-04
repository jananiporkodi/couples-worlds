"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { login, LoginState } from "./actions";
import MoonMark from "@/components/layout/MoonMark";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full mt-2" disabled={pending}>
      {pending ? "Opening…" : "Open our world"}
    </button>
  );
}

export default function LockScreen({
  redirectTo,
  partnerNames,
  savedPartner,
}: {
  redirectTo: string;
  partnerNames: { a: string; b: string };
  savedPartner: "partner_a" | "partner_b" | null;
}) {
  const [state, formAction] = useFormState(login, initialState);
  const [partner, setPartner] = useState<"partner_a" | "partner_b" | "">(savedPartner ?? "");

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 bg-cream">
      {["✦", "✧", "✦", "✧", "✦"].map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-lg select-none pointer-events-none text-ink/20"
          style={{
            top: `${15 + i * 16}%`,
            left: i % 2 === 0 ? `${10 + i * 6}%` : undefined,
            right: i % 2 !== 0 ? `${8 + i * 5}%` : undefined,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {s}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm card-panel !bg-white p-8 text-center"
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-peach flex items-center justify-center shadow-inner">
          <MoonMark className="w-8 h-8 text-accent" />
        </div>
        <h1 className="font-hand text-4xl leading-none text-ink mb-1">Our Little World</h1>
        <p className="text-xs italic text-ink-soft mb-6">enter our secret ❤️</p>

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="partner" value={partner} />

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1.5 text-left">Who&apos;s this?</p>
            <div className="flex rounded-full border border-ink/15 overflow-hidden">
              <button
                type="button"
                onClick={() => setPartner("partner_a")}
                className={`flex-1 px-3 py-2 text-xs font-semibold transition ${
                  partner === "partner_a" ? "bg-ink text-white" : "text-ink-soft"
                }`}
              >
                {partnerNames.a}
              </button>
              <button
                type="button"
                onClick={() => setPartner("partner_b")}
                className={`flex-1 px-3 py-2 text-xs font-semibold transition ${
                  partner === "partner_b" ? "bg-ink text-white" : "text-ink-soft"
                }`}
              >
                {partnerNames.b}
              </button>
            </div>
          </div>

          <input
            type="password"
            name="passcode"
            autoFocus
            placeholder="Our passcode"
            className="input-field text-center tracking-[0.3em] text-lg"
            inputMode="text"
          />
          {state?.error ? (
            <p className="text-xs text-accent font-semibold">{state.error}</p>
          ) : null}
          <SubmitButton />
        </form>

        <p className="mt-6 text-[11px] text-ink-soft">just for us, made with love</p>
      </motion.div>
    </main>
  );
}
