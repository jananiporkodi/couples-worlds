"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { GalleryMedia } from "@/lib/types";
import Lightbox from "./Lightbox";
import { addGalleryPhotos } from "@/app/(app)/gallery/actions";

const TABS = [
  { key: "favorites", label: "our favorites" },
  { key: "his", label: "his" },
  { key: "hers", label: "hers" },
  { key: "trips", label: "trips" },
  { key: "selfies", label: "selfies" },
  { key: "random", label: "random moments" },
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? "Uploading…" : "upload"}
    </button>
  );
}

const PERSON_OPTIONS = [
  { key: "us", label: "us" },
  { key: "him", label: "him" },
  { key: "her", label: "her" },
] as const;

function UploadForm({
  onDone,
  defaultPerson,
  defaultTags,
}: {
  onDone: () => void;
  defaultPerson: (typeof PERSON_OPTIONS)[number]["key"];
  defaultTags: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [person, setPerson] = useState<(typeof PERSON_OPTIONS)[number]["key"]>(defaultPerson);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await addGalleryPhotos(formData);
        formRef.current?.reset();
        setPerson(defaultPerson);
        onDone();
      }}
      className="card-panel p-4 space-y-2.5 mb-5"
    >
      <input type="file" name="photos" accept="image/*,video/*" multiple className="input-field !py-2 text-xs" required />
      <input name="caption" placeholder="One caption for this batch (optional)" className="input-field" />
      <input type="hidden" name="tags" value={defaultTags} />

      <div>
        <p className="text-[11px] text-ink-soft mb-1">who&apos;s this for?</p>
        <div className="flex gap-1.5">
          {PERSON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPerson(opt.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                person === opt.key ? "bg-bezel text-white" : "bg-black/[0.04] dark:bg-white/10 text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="person" value={person} />
      </div>

      <label className="flex items-center gap-1.5 text-xs text-ink-soft">
        <input type="checkbox" name="favorite" className="accent-accent" />
        add to our favorites too
      </label>

      <div className="flex gap-2">
        <SubmitButton />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
      </div>
    </form>
  );
}

export default function GalleryClient({ media }: { media: GalleryMedia[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("favorites");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const defaultPerson: (typeof PERSON_OPTIONS)[number]["key"] = tab === "his" ? "him" : tab === "hers" ? "her" : "us";
  const defaultTags = tab === "trips" ? "trip" : tab === "selfies" ? "selfie" : "";

  const filtered = useMemo(() => {
    switch (tab) {
      case "favorites":
        return media.filter((m) => m.is_favorite);
      case "his":
        return media.filter((m) => m.person === "him");
      case "hers":
        return media.filter((m) => m.person === "her");
      case "trips":
        return media.filter((m) => m.tags?.some((t) => t.toLowerCase().includes("trip") || t.toLowerCase() === "travel"));
      case "selfies":
        return media.filter((m) => m.tags?.some((t) => t.toLowerCase().includes("selfie")));
      case "random":
      default:
        return media;
    }
  }, [media, tab]);

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Gallery 🖼</p>
      <p className="text-sm text-ink-soft mb-5">every little moment, in one place</p>

      {uploading ? (
        <UploadForm key={tab} onDone={() => setUploading(false)} defaultPerson={defaultPerson} defaultTags={defaultTags} />
      ) : (
        <button onClick={() => setUploading(true)} className="btn-ghost !py-2 !px-4 text-sm mb-5">
          + upload photos
        </button>
      )}

      <div className="flex flex-wrap gap-4 mb-5 text-sm font-semibold text-ink-soft">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-1 ${tab === t.key ? "text-ink border-b-2 border-peach-deep" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing here yet. Photos you add from Memories or the Bucket List will show up in the right tab.</p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setLightboxIndex(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setLightboxIndex(i);
              }}
              className="relative w-full mb-3 block rounded-xl overflow-hidden shadow-[0_4px_10px_rgba(20,20,20,0.08)] break-inside-avoid cursor-pointer"
            >
              <Image
                src={item.url}
                alt={item.caption ?? ""}
                width={400}
                height={400}
                className="w-full h-auto object-cover"
              />
              {(item.caption || item.memory_id) && (
                <span className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
                  {item.caption && (
                    <span className="block text-sm leading-snug text-white/95 font-hand truncate text-left">
                      {item.caption}
                    </span>
                  )}
                  {item.memory_id && (
                    <Link
                      href={`/memories?open=${item.memory_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-white/85 underline underline-offset-2"
                    >
                      view memory
                    </Link>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Lightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
