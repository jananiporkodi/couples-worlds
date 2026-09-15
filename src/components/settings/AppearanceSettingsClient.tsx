"use client";

import { useRef, useState } from "react";
import { updateAppearance } from "@/app/(app)/settings/actions";
import { SaveButton, SavedConfirmation } from "./SaveControl";
import { THEMES, FONT_PAIRINGS, CORNER_STYLES, DEFAULT_THEME, DEFAULT_FONT_PAIRING, DEFAULT_CORNER_STYLE, fontRoleStyle } from "@/lib/appearance";

export default function AppearanceSettingsClient({ settings }: { settings: Record<string, unknown> }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState((settings.theme as string) || DEFAULT_THEME);
  const [fontPairing, setFontPairing] = useState((settings.font_pairing as string) || DEFAULT_FONT_PAIRING);
  const [cornerStyle, setCornerStyle] = useState((settings.corner_style as string) || DEFAULT_CORNER_STYLE);
  const [motionEnabled, setMotionEnabled] = useState(settings.motion_enabled !== false);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        formData.set("theme", theme);
        formData.set("fontPairing", fontPairing);
        formData.set("cornerStyle", cornerStyle);
        if (motionEnabled) formData.set("motionEnabled", "on");
        await updateAppearance(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1">Color theme</p>
        <p className="text-xs text-ink-soft mb-4">Changes hearts, buttons, links and highlights. The canvas always stays light.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTheme(t.key)}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 border transition ${
                theme === t.key ? "border-accent bg-accent/5" : "border-ink/10 hover:bg-black/[0.02] dark:hover:bg-white/5"
              }`}
            >
              <span
                className="w-8 h-8 rounded-full border border-black/10"
                style={{ backgroundColor: t.swatchHex }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold text-center leading-tight">
                {t.label}
                {t.key === DEFAULT_THEME && <span className="block text-[9px] font-normal text-ink-soft">default</span>}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1">Font</p>
        <p className="text-xs text-ink-soft mb-4">A small curated set - preview before you pick.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FONT_PAIRINGS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFontPairing(f.key)}
              style={fontRoleStyle(f) as unknown as React.CSSProperties}
              className={`text-left rounded-xl p-4 border transition ${
                fontPairing === f.key ? "border-accent bg-accent/5" : "border-ink/10 hover:bg-black/[0.02] dark:hover:bg-white/5"
              }`}
            >
              <p className="font-hand text-2xl leading-none mb-1">Our Memories</p>
              <p className="font-sans text-sm text-ink-soft italic mb-2">
                &ldquo;The little things became our favourite things.&rdquo;
              </p>
              <p className="text-[11px] font-bold not-italic font-sans">
                {f.label}
                {f.key === DEFAULT_FONT_PAIRING && <span className="font-normal text-ink-soft"> · default</span>}
              </p>
              <p className="text-[11px] text-ink-soft font-sans">{f.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card-panel p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-4">A few more small touches</p>

        <div className="flex items-center justify-between py-2 border-b border-dashed border-black/10 dark:border-white/10">
          <div>
            <p className="text-sm font-semibold">Gentle animations</p>
            <p className="text-xs text-ink-soft">Floating stars and subtle transitions.</p>
          </div>
          <button
            type="button"
            onClick={() => setMotionEnabled((v) => !v)}
            aria-pressed={motionEnabled}
            className={`relative w-11 h-6 rounded-full transition ${motionEnabled ? "bg-accent" : "bg-ink/20"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                motionEnabled ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 pt-3">
          <div>
            <p className="text-sm font-semibold">Corners</p>
            <p className="text-xs text-ink-soft">A subtle difference in cards and inputs.</p>
          </div>
          <div className="flex rounded-full border border-ink/15 overflow-hidden">
            {CORNER_STYLES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCornerStyle(c.key)}
                className={`px-3 py-1.5 text-xs font-semibold ${
                  cornerStyle === c.key ? "bg-bezel text-white" : "text-ink-soft"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SaveButton label="save appearance" />
        <SavedConfirmation show={saved} />
      </div>
    </form>
  );
}
