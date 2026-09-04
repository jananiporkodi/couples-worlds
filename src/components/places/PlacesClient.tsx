"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { Memory, Place } from "@/lib/types";
import { addPlace, deletePlace, updatePlaceCoords } from "@/app/(app)/places/actions";

const PlaceMap = dynamic(() => import("./PlaceMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-sm text-ink-soft">Loading map…</div>,
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary !py-2 !px-4 text-sm" disabled={pending}>
      {pending ? "Adding…" : "+ add place"}
    </button>
  );
}

export default function PlacesClient({
  places,
  memories,
  initialSelectedId,
}: {
  places: Place[];
  memories: Memory[];
  initialSelectedId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [addingOpen, setAddingOpen] = useState(false);
  const [editingPinId, setEditingPinId] = useState<string | null>(null);
  const [savingPin, setSavingPin] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const memoriesByPlace = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const m of memories) {
      if (!m.place_id) continue;
      const list = map.get(m.place_id) ?? [];
      list.push(m);
      map.set(m.place_id, list);
    }
    return map;
  }, [memories]);

  const selectedPlace = places.find((p) => p.id === selectedId) ?? null;
  const selectedMemories = selectedId ? memoriesByPlace.get(selectedId) ?? [] : [];

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Places we&apos;ve been 📍</p>
      <p className="text-sm text-ink-soft mb-5">every spot that became part of our story</p>

      <div className="mb-5">
        {addingOpen ? (
          <form
            ref={formRef}
            action={async (formData) => {
              await addPlace(formData);
              formRef.current?.reset();
              setAddingOpen(false);
            }}
            className="card-panel p-4 space-y-2.5 max-w-md"
          >
            <input name="name" placeholder="Place name" className="input-field" required />
            <div className="grid grid-cols-2 gap-2.5">
              <input name="city" placeholder="City (optional)" className="input-field" />
              <input name="country" placeholder="Country (optional)" className="input-field" />
            </div>
            <textarea name="description" placeholder="A little description (optional)" className="input-field" rows={2} />
            <div className="flex gap-2">
              <SubmitButton />
              <button type="button" onClick={() => setAddingOpen(false)} className="btn-ghost !py-2 !px-3 text-sm">
                cancel
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setAddingOpen(true)} className="btn-ghost !py-2 !px-4 text-sm">
            + add a place
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card-panel overflow-hidden h-[420px]">
          <PlaceMap
            places={places}
            selectedId={selectedId}
            onSelect={setSelectedId}
            editingId={editingPinId}
            onPinMoved={async (lat, lng) => {
              if (!editingPinId) return;
              setSavingPin(true);
              await updatePlaceCoords(editingPinId, lat, lng);
              setSavingPin(false);
            }}
          />
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {places.length === 0 && <p className="text-sm text-ink-soft">No places yet — add your first one above.</p>}
          {places.map((place) => {
            const count = memoriesByPlace.get(place.id)?.length ?? 0;
            return (
              <button
                key={place.id}
                onClick={() => setSelectedId(place.id)}
                className={`card-panel p-3 w-full text-left ${selectedId === place.id ? "border-accent" : ""}`}
              >
                <p className="font-hand text-xl leading-tight">{place.name}</p>
                <p className="text-[11px] text-ink-soft">
                  {[place.city, place.country].filter(Boolean).join(", ") || "no coordinates yet"}
                </p>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  {count} {count === 1 ? "memory" : "memories"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPlace && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-hand text-2xl">{selectedPlace.name}</p>
            <div className="flex items-center gap-2">
              {editingPinId === selectedPlace.id ? (
                <button
                  onClick={() => setEditingPinId(null)}
                  className="btn-ghost !py-1 !px-2 text-[11px] text-accent"
                >
                  {savingPin ? "saving…" : "done fixing pin ✓"}
                </button>
              ) : (
                <button
                  onClick={() => setEditingPinId(selectedPlace.id)}
                  className="btn-ghost !py-1 !px-2 text-[11px]"
                >
                  fix pin location
                </button>
              )}
              <button
                onClick={async () => {
                  await deletePlace(selectedPlace.id);
                  setSelectedId(null);
                }}
                className="btn-ghost !py-1 !px-2 text-[11px] text-accent"
              >
                delete place
              </button>
            </div>
          </div>
          {editingPinId === selectedPlace.id && (
            <p className="text-[11px] text-ink-soft mt-1">Drag the pin on the map above, or click anywhere on it, to move it exactly where it should be.</p>
          )}
          {selectedPlace.description && <p className="text-sm text-ink-soft mt-1">{selectedPlace.description}</p>}

          {selectedMemories.length === 0 ? (
            <p className="text-sm text-ink-soft mt-3">No memories linked to this place yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
              {selectedMemories.map((m) => (
                <Link
                  key={m.id}
                  href={`/memories?open=${m.id}`}
                  className="card-panel p-3 flex gap-3 items-center hover:-translate-y-0.5 transition"
                >
                  {m.photos?.[0] && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={m.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{m.title || "A memory"}</p>
                    <p className="text-[11px] text-ink-soft">{m.memory_date}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
