"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadManyMediaFiles } from "@/lib/storage";
import type { PartnerAssignee, PlanStatus } from "@/lib/types";

export async function addPlan(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const planDate = String(formData.get("planDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim() || null;
  const endTime = String(formData.get("endTime") ?? "").trim() || null;
  const person = (String(formData.get("person") ?? "both").trim() || "both") as PartnerAssignee;
  const category = String(formData.get("category") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const reminderRaw = String(formData.get("reminderMinutesBefore") ?? "").trim();
  const reminderMinutesBefore = reminderRaw ? Number(reminderRaw) : null;

  if (!title || !planDate) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("plans").insert({
    title,
    description,
    plan_date: planDate,
    start_time: startTime,
    end_time: endTime,
    person,
    category,
    location,
    reminder_minutes_before: reminderMinutesBefore,
  });
  if (error) throw error;

  revalidatePath("/plans");
  revalidatePath("/");
}

export async function markPlanStatus(planId: string, status: PlanStatus) {
  if (!planId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("plans").update({ status }).eq("id", planId);
  if (error) throw error;

  revalidatePath("/plans");
  revalidatePath("/");
}

export async function deletePlan(planId: string) {
  if (!planId) return;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("plans").delete().eq("id", planId);
  if (error) throw error;

  revalidatePath("/plans");
  revalidatePath("/");
}

/** Converts a past plan into a Memory, carrying over title/date/time/location/notes/people, then linking the two records together. */
export async function convertPlanToMemory(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  if (!planId) return;

  const supabase = getSupabaseServerClient();
  const { data: plan, error: planError } = await supabase.from("plans").select("*").eq("id", planId).single();
  if (planError) throw planError;

  const title = String(formData.get("title") ?? plan.title ?? "").trim() || plan.title;
  const story = String(formData.get("story") ?? "").trim() || plan.description || null;
  const location = String(formData.get("location") ?? plan.location ?? "").trim() || null;
  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const files = formData.getAll("photos") as File[];

  const photoUrls = await uploadManyMediaFiles("memory-media", files, "memories");

  const { data: memory, error: memoryError } = await supabase
    .from("memories")
    .insert({
      title,
      story,
      location,
      memory_date: plan.plan_date,
      tags,
      photos: photoUrls,
    })
    .select()
    .single();
  if (memoryError) throw memoryError;

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

  const { error: updateError } = await supabase
    .from("plans")
    .update({ memory_id: memory.id, status: "done" })
    .eq("id", planId);
  if (updateError) throw updateError;

  revalidatePath("/plans");
  revalidatePath("/memories");
  revalidatePath("/gallery");
  revalidatePath("/");
}
