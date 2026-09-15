"use client";

import { useState } from "react";
import AddTimelineEventForm from "./AddTimelineEventForm";
import AddMemoryForm from "@/components/memories/AddMemoryForm";

/**
 * Not every entry on the timeline needs to be a full "milestone" event - some are just memories.
 * This gives a choice right from the Timeline page instead of forcing everything through the
 * milestone form (which is meant for lightweight events like "first date" that don't need photos
 * or a full story).
 */
export default function TimelineAddButtons() {
  const [mode, setMode] = useState<"none" | "milestone" | "memory">("none");

  if (mode === "milestone") return <AddTimelineEventForm autoOpen onClose={() => setMode("none")} />;
  if (mode === "memory") return <AddMemoryForm autoOpen onClose={() => setMode("none")} />;

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => setMode("milestone")} className="btn-primary">
        + add a milestone
      </button>
      <button onClick={() => setMode("memory")} className="btn-secondary">
        + add a memory
      </button>
    </div>
  );
}
