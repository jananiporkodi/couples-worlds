"use client";

import { useState } from "react";
import SettingsClient from "./SettingsClient";
import AppearanceSettingsClient from "./AppearanceSettingsClient";

const TABS = [
  { key: "couple", label: "Couple" },
  { key: "appearance", label: "Appearance" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsTabs({
  settings,
  currentPartner,
}: {
  settings: Record<string, unknown>;
  currentPartner: "partner_a" | "partner_b" | null;
}) {
  const [tab, setTab] = useState<TabKey>("couple");

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Settings 🌙</p>
      <p className="text-sm text-ink-soft mb-4">the basics that make this world yours</p>

      <div className="flex rounded-full border border-ink/15 overflow-hidden w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-xs font-semibold transition ${
              tab === t.key ? "bg-ink text-white" : "text-ink-soft hover:bg-black/[0.03] dark:hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "couple" && <SettingsClient settings={settings} currentPartner={currentPartner} />}
      {tab === "appearance" && <AppearanceSettingsClient settings={settings} />}
    </div>
  );
}
