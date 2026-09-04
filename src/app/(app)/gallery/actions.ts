"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadManyMediaFiles } from "@/lib/storage";

/** Direct-to-Gallery upload, independent of Memories. One optional caption applies to the whole batch. */
export async function addGalleryPhotos(formData: FormData) {
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const files = formData.getAll("photos") as File[];
  const urls = await uploadManyMediaFiles("memory-media", files, "gallery");
  if (urls.length === 0) return;

  const supabase = getSupabaseServerClient();
  const rows = urls.map((url) => ({
    url,
    media_type: "photo" as const,
    tags: [],
    person: "us" as const,
    caption,
  }));
  const { error } = await supabase.from("gallery").insert(rows);
  if (error) throw error;

  revalidatePath("/gallery");
}
