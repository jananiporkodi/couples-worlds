"use client";

import { useMemo, useState } from "react";
import type { BucketItem } from "@/lib/types";
import { BUCKET_CATEGORIES } from "@/lib/types";
import AddBucketItemForm from "./AddBucketItemForm";
import BucketItemCard from "./BucketItemCard";

export default function BucketListClient({ items }: { items: BucketItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const usedCategories = useMemo(() => {
    const known = new Set(items.map((i) => i.category));
    const builtIn: { key: string; label: string; emoji: string }[] = BUCKET_CATEGORIES.filter((c) =>
      known.has(c.key)
    );
    const custom: { key: string; label: string; emoji: string }[] = [...known]
      .filter((k) => !BUCKET_CATEGORIES.some((c) => c.key === k))
      .map((k) => ({ key: k, label: k, emoji: "✏️" }));
    return builtIn.concat(custom);
  }, [items]);

  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items;
  const done = filtered.filter((i) => i.status === "done").length;

  return (
    <div>
      <p className="font-hand text-4xl md:text-5xl leading-none mb-1">Our bucket list 🪣</p>
      <p className="text-sm text-ink-soft mb-6">
        {done} done · {filtered.length - done} still dreaming
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveCategory(null)}
          className={`chip ${!activeCategory ? "bg-peach text-accent" : "bg-black/5 dark:bg-white/10 text-ink-soft"}`}
        >
          all
        </button>
        {usedCategories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`chip ${
              activeCategory === c.key ? "bg-peach text-accent" : "bg-black/5 dark:bg-white/10 text-ink-soft"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <AddBucketItemForm />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing here yet — add your first adventure above.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <BucketItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
