"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLogin, AdminLoginState } from "./actions";

const initialState: AdminLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full mt-2" disabled={pending}>
      {pending ? "Checking…" : "Enter admin"}
    </button>
  );
}

export default function AdminLockScreen() {
  const [state, formAction] = useFormState(adminLogin, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm card-panel !bg-white p-8 text-center">
        <h1 className="font-hand text-3xl leading-none text-ink mb-1">Couples Worlds</h1>
        <p className="text-xs italic text-ink-soft mb-6">admin — for you only</p>

        <form action={formAction} className="space-y-3">
          <input
            type="password"
            name="passcode"
            autoFocus
            placeholder="Admin passcode"
            className="input-field text-center tracking-[0.3em] text-lg"
          />
          {state?.error ? <p className="text-xs text-accent font-semibold">{state.error}</p> : null}
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
