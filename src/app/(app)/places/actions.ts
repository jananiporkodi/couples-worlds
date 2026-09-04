"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { geocodePlace } from "@/lib/geocode";

export async function addPlace(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;

  const geo = await geocodePlace([name, city, country].filter(Boolean).join(", "));

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("places").insert({
    name,
    city,
    country,
    description,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
  });
  if (error) throw error;

  revalidatePath("/places");
  revalidatePath("/");
}

export async function deletePlace(placeId: string) {
  if (!placeId) return;
  const supabase = getSupabaseServerClient();
  await supabase.from("memories").update({ place_id: null }).eq("place_id", placeId);
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw error;

  revalidatePath("/places");
  revalidatePath("/memories");
  revalidatePath("/");
}

/** Manually corrects a place's pin position - used when the auto-geocoded spot lands in the wrong location. */
export async function updatePlaceCoords(placeId: string, lat: number, lng: number) {
  if (!placeId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("places").update({ lat, lng }).eq("id", placeId);
  if (error) throw error;

  revalidatePath("/places");
  revalidatePath("/");
}
