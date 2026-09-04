"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function addLoveJarEntry(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || null;
  if (!body) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("love_jar").insert({ body, author });
  if (error) throw error;
  revalidatePath("/us");
  revalidatePath("/");
}

export async function addCountdown(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  if (!title || !targetDate) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("countdowns").insert({ title, target_date: targetDate, emoji });
  if (error) throw error;
  revalidatePath("/us");
  revalidatePath("/");
}
