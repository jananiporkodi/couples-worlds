"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadManyMediaFiles } from "@/lib/storage";
import { geocodePlace } from "@/lib/geocode";
import { sendEmail } from "@/lib/mailer";
import { getSettingsMap } from "@/lib/data";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";

/** Emails the OTHER partner when one of them adds a memory - a no-op if identity/emails are not set up. */
async function notifyOtherPartnerOfMemory(memoryTitle: string) {
  try {
    const adder = cookies().get(PARTNER_COOKIE_NAME)?.value;
    if (!isValidPartnerId(adder)) return;

    const settings = await getSettingsMap();
    const isPartnerA = adder === "partner_a";
    const adderName = (isPartnerA ? settings.partner_a_name : settings.partner_b_name) as string | undefined;
    const recipientEmail = (isPartnerA ? settings.partner_b_email : settings.partner_a_email) as string | undefined;
    if (!recipientEmail) return;

    await sendEmail({
      to: recipientEmail,
      subject: (adderName || "Your partner") + " added a new memory",
      html:
        "<p>" + (adderName || "Your partner") + " just added a new memory" +
        (memoryTitle ? (": <strong>" + memoryTitle + "</strong>") : "") +
        " to Our Little World.</p><p>Go take a look!</p>",
    });
  } catch (err) {
    console.error("notifyOtherPartnerOfMemory failed:", err);
  }
}

export async function addMemory(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim() || null;
  const story = String(formData.get("story") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const memoryDate = String(formData.get("memoryDate") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const files = formData.getAll("photos") as File[];

  const photoUrls = await uploadManyMediaFiles("memory-media", files, "memories");

  const supabase = getSupabaseServerClient();
  const { data: memory, error } = await supabase
    .from("memories")
    .insert({
      title,
      story,
      location,
      mood,
      memory_date: memoryDate,
      tags,
      photos: photoUrls,
    })
    .select()
    .single();
  if (error) throw error;

  if (photoUrls.length > 0) {
    const rows = photoUrls.map((url) => ({
      memory_id: memory.id,
      url,
      media_type: "photo" as const,
      tags,
      person: "us" as const,
    }));
    await supabase.from("gallery").insert(rows);
  }

  revalidatePath("/memories");
  revalidatePath("/gallery");
  revalidatePath("/");

  await notifyOtherPartnerOfMemory(title || "");
}

/** Resolves the place a memory should link to: an existing place id, a brand-new place (best-effort geocoded), or none. */
async function resolvePlaceId(formData: FormData): Promise<string | null | undefined> {
  const existingPlaceId = String(formData.get("placeId") ?? "").trim();
  if (existingPlaceId === "__new__") {
    const name = String(formData.get("newPlaceName") ?? "").trim();
    if (!name) return undefined;
    const city = String(formData.get("newPlaceCity") ?? "").trim() || null;
    const country = String(formData.get("newPlaceCountry") ?? "").trim() || null;
    const supabase = getSupabaseServerClient();
    const geo = await geocodePlace([name, city, country].filter(Boolean).join(", "));
    const { data: place, error } = await supabase
      .from("places")
      .insert({ name, city, country, lat: geo?.lat ?? null, lng: geo?.lng ?? null })
      .select()
      .single();
    if (error) throw error;
    return place.id as string;
  }
  if (existingPlaceId === "__none__") return null;
  if (existingPlaceId) return existingPlaceId;
  return undefined;
}

/**
 * Full memory edit: title/story/date/location/mood/tags/place/favorite/notes,
 * plus multi-photo management. The client sends the surviving photo URLs (in
 * the order the user arranged them — index 0 is the cover) as repeated
 * "existingPhotos" fields, and any newly picked files as "newPhotos".
 */
export async function updateMemory(formData: FormData) {
  const memoryId = String(formData.get("memoryId") ?? "").trim();
  if (!memoryId) return;

  const title = String(formData.get("title") ?? "").trim() || null;
  const story = String(formData.get("story") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const mood = String(formData.get("mood") ?? "").trim() || null;
  const memoryDate = String(formData.get("memoryDate") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const noteA = String(formData.get("noteA") ?? "").trim() || null;
  const noteB = String(formData.get("noteB") ?? "").trim() || null;
  const isFavorite = formData.get("isFavorite") === "on";

  const keptPhotos = formData.getAll("existingPhotos").map(String).filter(Boolean);
  const newFiles = formData.getAll("newPhotos") as File[];

  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("memories")
    .select("photos")
    .eq("id", memoryId)
    .single();
  if (fetchError) throw fetchError;

  const previousPhotos = (existing?.photos as string[] | null) ?? [];
  const removedPhotos = previousPhotos.filter((url) => !keptPhotos.includes(url));

  const newPhotoUrls = await uploadManyMediaFiles("memory-media", newFiles, "memories");
  const finalPhotos = [...keptPhotos, ...newPhotoUrls];

  const placeId = await resolvePlaceId(formData);

  const update: Record<string, unknown> = {
    title,
    story,
    location,
    mood,
    tags,
    photos: finalPhotos,
    note_a: noteA,
    note_b: noteB,
    is_favorite: isFavorite,
  };
  if (memoryDate) update.memory_date = memoryDate;
  if (placeId !== undefined) update.place_id = placeId;

  const { error } = await supabase.from("memories").update(update).eq("id", memoryId);
  if (error) throw error;

  if (removedPhotos.length > 0) {
    await supabase.from("gallery").delete().eq("memory_id", memoryId).in("url", removedPhotos);
  }
  if (newPhotoUrls.length > 0) {
    const rows = newPhotoUrls.map((url) => ({
      memory_id: memoryId,
      url,
      media_type: "photo" as const,
      tags,
      person: "us" as const,
    }));
    await supabase.from("gallery").insert(rows);
  }

  revalidatePath("/memories");
  revalidatePath("/gallery");
  revalidatePath("/places");
  revalidatePath("/");
}

export async function toggleMemoryFavorite(memoryId: string, value: boolean) {
  if (!memoryId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("memories").update({ is_favorite: value }).eq("id", memoryId);
  if (error) throw error;

  revalidatePath("/memories");
  revalidatePath("/");
}

export async function deleteMemory(memoryId: string) {
  if (!memoryId) return;
  const supabase = getSupabaseServerClient();
  await supabase.from("gallery").delete().eq("memory_id", memoryId);
  const { error } = await supabase.from("memories").delete().eq("id", memoryId);
  if (error) throw error;

  revalidatePath("/memories");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function reactToMemory(memoryId: string, emoji: string) {
  const supabase = getSupabaseServerClient();
  const { data: memory, error: fetchError } = await supabase
    .from("memories")
    .select("reactions")
    .eq("id", memoryId)
    .single();
  if (fetchError) throw fetchError;

  const reactions = { ...(memory?.reactions ?? {}) } as Record<string, number>;
  reactions[emoji] = (reactions[emoji] ?? 0) + 1;

  const { error } = await supabase.from("memories").update({ reactions }).eq("id", memoryId);
  if (error) throw error;

  revalidatePath("/memories");
}
