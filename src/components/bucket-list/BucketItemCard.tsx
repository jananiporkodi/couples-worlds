"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BucketItem } from "@/lib/types";
import { BUCKET_CATEGORIES } from "@/lib/types";
import IllustrationBlock from "./IllustrationBlock";
import CompleteActivityForm from "./CompleteActivityForm";

const PRIORITY_DOTS: Record<string, string> = {
  low: "●",
  medium: "●●",
  high: "●●●",
};

export default function BucketItemCard({ item }: { item: BucketItem }) {
  const [completing, setCompleting] = useState(false);
  const categoryMeta = BUCKET_CATEGORIES.find((c) => c.key === item.category);
  const categoryLabel = categoryMeta ? `${categoryMeta.emoji} ${categoryMeta.label}` : `✏️ ${item.category}`;

  return (
    <motion.div layout className="card-panel p-4 relative">
      <div className="flex gap-3 items-start">
        <IllustrationBlock
          itemId={item.id}
          illustrationUrl={item.illustration_url}
          illustrationPrompt={item.illustration_prompt}
          category={item.category}
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-ink">{item.title}</p>
          {item.description && <p className="text-xs text-ink-soft mt-0.5 line-clamp-2">{item.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="chip bg-lavender text-bezel">{categoryLabel}</span>
            <span
              className={`status-pill text-[10px] font-bold px-2.5 py-1 rounded-full ${
                item.status === "done" ? "bg-sage-deep text-white" : "bg-black/5 dark:bg-white/10 text-ink-soft"
              }`}
            >
              {item.status === "done" ? "✓ done" : "not done"}
            </span>
            <span className="text-[10px] text-ink-soft" title={`priority: ${item.priority}`}>
              {PRIORITY_DOTS[item.priority]}
            </span>
          </div>
        </div>

        {item.status === "not_done" && !completing && (
          <button onClick={() => setCompleting(true)} className="btn-ghost !py-1.5 !px-3 text-[11px] flex-shrink-0">
            mark done
          </button>
        )}
      </div>

      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CompleteActivityForm itemId={item.id} onDone={() => setCompleting(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
