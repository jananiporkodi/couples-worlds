"use client";

import { useEffect, useState } from "react";
import type { BucketItem, Memory, Place, Plan } from "@/lib/types";
import MemoryCard from "./MemoryCard";
import MemoryModal from "./MemoryModal";
import AddMemoryForm from "./AddMemoryForm";

export default function MemoriesClient({
  memories,
  plans,
  bucketItems,
  places,
  partnerNames,
  initialOpenId,
}: {
  memories: Memory[];
  plans: Plan[];
  bucketItems: BucketItem[];
  places: Place[];
  partnerNames: { a: string; b: string };
  initialOpenId: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  useEffect(() => {
    if (initialOpenId) setOpenId(initialOpenId);
  }, [initialOpenId]);

  const openMemory = memories.find((m) => m.id === openId) ?? null;

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Our memories 📸</p>
      <p className="text-sm text-ink-soft mb-6">a scrapbook that&apos;s still being written</p>

      <div className="mb-6">
        <AddMemoryForm />
      </div>

      {memories.length === 0 ? (
        <p className="text-sm text-ink-soft">No memories yet — complete a bucket list item or add one above.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      )}

      {openMemory && (
        <MemoryModal
          memory={openMemory}
          plans={plans}
          bucketItems={bucketItems}
          places={places}
          partnerNames={partnerNames}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
