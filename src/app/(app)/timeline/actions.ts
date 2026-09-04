"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadManyMediaFiles } from "@/lib/storage";

export async function addTimelineEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const files = formData.getAll("photos") as File[];

  if (!title || !eventDate) return;

  const photoUrls = await uploadManyMediaFiles("memory-media", files, "timeline");

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("timeline_events").insert({
    title,
    description,
    event_date: eventDate,
    mood,
    photos: photoUrls,
  });
  if (error) throw error;

  revalidatePath("/timeline");
}
