"use client";

import { useRef, useState } from "react";
import { updateSettings, setCurrentPartner } from "@/app/(app)/settings/actions";
import { SaveButton, SavedConfirmation } from "./SaveControl";

export default function SettingsClient({
  settings,
  currentPartner,
}: {
  settings: Record<string, unknown>;
  currentPartner: "partner_a" | "partner_b" | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  const partnerAName = (settings.partner_a_name as string) || "Partner A";
  const partnerBName = (settings.partner_b_name as string) || "Partner B";

  return (
    <div>
      <div className="card-panel p-4 mb-6 max-w-md flex items-center justify-between text-sm">
        <span className="text-ink-soft">
          This device is identified as{" "}
          <span className="font-bold text-ink">
            {currentPartner === "partner_a" ? partnerAName : currentPartner === "partner_b" ? partnerBName : "not set"}
          </span>
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPartner("partner_a")}
            className={`btn-ghost !py-1 !px-2 text-[11px] ${currentPartner === "partner_a" ? "!bg-peach !text-accent" : ""}`}
          >
            {partnerAName}
          </button>
          <button
            onClick={() => setCurrentPartner("partner_b")}
            className={`btn-ghost !py-1 !px-2 text-[11px] ${currentPartner === "partner_b" ? "!bg-peach !text-accent" : ""}`}
          >
            {partnerBName}
          </button>
        </div>
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          await updateSettings(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="card-panel p-5 space-y-4 max-w-md"
      >
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
            Relationship start date
          </label>
          <input
            type="date"
            name="relationshipStartDate"
            defaultValue={(settings.relationship_start_date as string) ?? ""}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
            Anniversary date (optional)
          </label>
          <input
            type="date"
            name="anniversaryDate"
            defaultValue={(settings.anniversary_date as string) ?? ""}
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner A name
            </label>
            <input name="partnerAName" defaultValue={(settings.partner_a_name as string) ?? ""} className="input-field" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner B name
            </label>
            <input name="partnerBName" defaultValue={(settings.partner_b_name as string) ?? ""} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner A birthday
            </label>
            <input
              type="date"
              name="partnerABirthday"
              defaultValue={(settings.partner_a_birthday as string) ?? ""}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner B birthday
            </label>
            <input
              type="date"
              name="partnerBBirthday"
              defaultValue={(settings.partner_b_birthday as string) ?? ""}
              className="input-field"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner A email
            </label>
            <input
              type="email"
              name="partnerAEmail"
              placeholder="for notification emails"
              defaultValue={(settings.partner_a_email as string) ?? ""}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
              Partner B email
            </label>
            <input
              type="email"
              name="partnerBEmail"
              placeholder="for notification emails"
              defaultValue={(settings.partner_b_email as string) ?? ""}
              className="input-field"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton label="save couple settings" />
          <SavedConfirmation show={saved} />
        </div>
      </form>
    </div>
  );
}
