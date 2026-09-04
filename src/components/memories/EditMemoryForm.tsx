"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import type { Memory, Place } from "@/lib/types";
import { updateMemory, deleteMemory } from "@/app/(app)/memories/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? "Saving…" : "save changes"}
    </button>
  );
}

export default function EditMemoryForm({
  memory,
  places,
  partnerNames,
  onDone,
}: {
  memory: Memory;
  places: Place[];
  partnerNames: { a: string; b: string };
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [photos, setPhotos] = useState<string[]>(memory.photos ?? []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [placeChoice, setPlaceChoice] = useState<string>(memory.place_id ?? "__none__");
  const [location, setLocation] = useState<string>(memory.location ?? "");
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceCity, setNewPlaceCity] = useState("");

  function handlePlaceChoiceChange(value: string) {
    setPlaceChoice(value);
    if (value !== "__none__" && value !== "__new__") {
      const place = places.find((p) => p.id === value);
      if (place) {
        setLocation([place.name, place.city].filter(Boolean).join(", "));
      }
    }
  }

  function makeCover(index: number) {
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }
  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }
  function move(index: number, dir: -1 | 1) {
    setPhotos((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await updateMemory(formData);
        onDone();
      }}
      className="space-y-2.5"
    >
      <input type="hidden" name="memoryId" value={memory.id} />
      {photos.map((url) => (
        <input key={url} type="hidden" name="existingPhotos" value={url} />
      ))}

      <div className="flex items-center justify-between">
        <p className="font-hand text-2xl">Edit memory</p>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <input type="checkbox" name="isFavorite" defaultChecked={memory.is_favorite} className="accent-accent" />
          favorite <span className="text-accent">♥</span>
        </label>
      </div>

      <input name="title" defaultValue={memory.title ?? ""} placeholder="Title (optional)" className="input-field" />
      <textarea name="story" defaultValue={memory.story ?? ""} placeholder="Tell the story…" className="input-field" rows={3} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" name="memoryDate" defaultValue={memory.memory_date} className="input-field" />
        <input name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location text (optional)" className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select name="mood" defaultValue={memory.mood ?? ""} className="input-field">
          <option value="">mood (optional)</option>
          <option value="😍">😍 loved it</option>
          <option value="🥹">🥹 emotional</option>
          <option value="😂">😂 fun</option>
          <option value="🥰">🥰 sweet</option>
        </select>
        <input name="tags" defaultValue={memory.tags?.join(", ") ?? ""} placeholder="tags, comma, separated" className="input-field" />
      </div>

      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">Place</label>
        <select
          name="placeId"
          value={placeChoice}
          onChange={(e) => handlePlaceChoiceChange(e.target.value)}
          className="input-field"
        >
          <option value="__none__">no linked place</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.country ? `, ${p.country}` : ""}
            </option>
          ))}
          <option value="__new__">+ add a new place…</option>
        </select>
        {placeChoice === "__new__" && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <input
              name="newPlaceName"
              placeholder="Place name"
              className="input-field"
              required
              value={newPlaceName}
              onChange={(e) => {
                setNewPlaceName(e.target.value);
                setLocation([e.target.value, newPlaceCity].filter(Boolean).join(", "));
              }}
            />
            <input
              name="newPlaceCity"
              placeholder="City (optional)"
              className="input-field"
              value={newPlaceCity}
              onChange={(e) => {
                setNewPlaceCity(e.target.value);
                setLocation([newPlaceName, e.target.value].filter(Boolean).join(", "));
              }}
            />
            <input name="newPlaceCountry" placeholder="Country (optional)" className="input-field" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
            Note from {partnerNames.a}
          </label>
          <textarea name="noteA" defaultValue={memory.note_a ?? ""} className="input-field" rows={2} />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-ink-soft block mb-1">
            Note from {partnerNames.b}
          </label>
          <textarea name="noteB" defaultValue={memory.note_b ?? ""} className="input-field" rows={2} />
        </div>
      </div>

      {photos.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1.5">
            Photos — first one is the cover
          </p>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden group flex-shrink-0">
                <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-0.5 left-0.5 text-[9px] font-bold bg-black/60 text-white px-1 rounded">
                    cover
                  </span>
                )}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeCover(i)} title="make cover">★</button>
                  )}
                  {i > 0 && (
                    <button type="button" onClick={() => move(i, -1)} title="move left">‹</button>
                  )}
                  {i < photos.length - 1 && (
                    <button type="button" onClick={() => move(i, 1)} title="move right">›</button>
                  )}
                  <button type="button" onClick={() => removePhoto(i)} title="remove">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1.5">Add more photos</p>
        <input type="file" name="newPhotos" accept="image/*,video/*" multiple className="input-field !py-2 text-xs" />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Submit />
        <button type="button" onClick={onDone} className="btn-ghost !py-2 !px-3 text-sm">
          cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!confirmingDelete) {
              setConfirmingDelete(true);
              return;
            }
            await deleteMemory(memory.id);
            onDone();
          }}
          className={`btn-ghost !py-2 !px-3 text-sm ml-auto ${confirmingDelete ? "text-accent" : ""}`}
        >
          {confirmingDelete ? "confirm delete?" : "delete memory"}
        </button>
      </div>
    </form>
  );
}
