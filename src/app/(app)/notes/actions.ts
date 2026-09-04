"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function addNote(formData: FormData) {
  const author = String(formData.get("author") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const mood = String(formData.get("mood") ?? "").trim() || null;

  if (!body) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("notes").insert({ author, body, mood });
  if (error) throw error;

  revalidatePath("/notes");
  revalidatePath("/");
}
