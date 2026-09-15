"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buildIllustrationPrompt } from "@/lib/illustration";
import { generateBucketArtwork } from "@/lib/artwork";
import { uploadManyMediaFiles } from "@/lib/storage";
import { notifyOtherPartner, getActorName } from "@/lib/push";
import type { Priority } from "@/lib/types";

export async function addBucketItem(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const categorySelect = String(formData.get("category") ?? "").trim();
  const customCategoryName = String(formData.get("customCategoryName") ?? "").trim();
  const priority = (String(formData.get("priority") ?? "medium").trim() || "medium") as Priority;

  if (!title || !categorySelect) return;

  const isCustom = categorySelect === "__custom__";
  const category = isCustom ? customCategoryName || "custom" : categorySelect;

  const illustration_prompt = buildIllustrationPrompt(title, category, description);

  // Best-effort auto-illustration. Returns null (no-op) if OPENAI_API_KEY
  // isn't configured or generation fails for any reason — the UI falls
  // back to a category-emoji tile in that case.
  const illustration_url = await generateBucketArtwork(illustration_prompt);

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("bucket_items").insert({
    title,
    description,
    category,
    is_custom_category: isCustom,
    priority,
    illustration_prompt,
    illustration_url,
  });

  if (error) throw error;

  revalidatePath("/bucket-list");
  revalidatePath("/", "layout");

  const actorName = await getActorName();
  await notifyOtherPartner({ title: `${actorName} added to the bucket list`, body: title, url: "/bucket-list" });
}

export async function completeBucketItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const files = formData.getAll("photos") as File[];

  if (!itemId) return;

  const supabase = getSupabaseServerClient();

  const { data: item, error: itemError } = await supabase
    .from("bucket_items")
    .select("*")
    .eq("id", itemId)
    .single();
  if (itemError) throw itemError;

  const photoUrls = await uploadManyMediaFiles("memory-media", files, "memories");

  const { data: memory, error: memoryError } = await supabase
    .from("memories")
    .insert({
      bucket_item_id: itemId,
      title: item.title,
      story: note || null,
      mood,
      location,
      tags: [item.category],
      photos: photoUrls,
    })
    .select()
    .single();
  if (memoryError) throw memoryError;

  if (photoUrls.length > 0) {
    const galleryRows = photoUrls.map((url) => ({
      memory_id: memory.id,
      url,
      media_type: "photo" as const,
      tags: [item.category],
      person: "us" as const,
    }));
    const { error: galleryError } = await supabase.from("gallery").insert(galleryRows);
    if (galleryError) throw galleryError;
  }

  const { error: updateError } = await supabase
    .from("bucket_items")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", itemId);
  if (updateError) throw updateError;

  revalidatePath("/bucket-list");
  revalidatePath("/memories");
  revalidatePath("/gallery");
  revalidatePath("/", "layout");
}

export async function deleteBucketItem(itemId: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("bucket_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath("/bucket-list");
}

export async function setIllustrationUrl(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const url = String(formData.get("illustrationUrl") ?? "").trim();
  if (!itemId || !url) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("bucket_items").update({ illustration_url: url }).eq("id", itemId);
  if (error) throw error;

  revalidatePath("/bucket-list");
}
