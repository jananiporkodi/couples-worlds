"use server";

import { createHash } from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CreateWorldState {
  error?: string;
  success?: string;
}

function hashPasscode(passcode: string): string {
  return createHash("sha256").update(passcode.trim()).digest("hex");
}

// Lowercase letters/numbers, single hyphens between segments - matches what
// the /w/{slug}/... routes expect (see src/middleware.ts's WORLD_PATH_RE).
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function createWorld(_prevState: CreateWorldState, formData: FormData): Promise<CreateWorldState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const passcode = String(formData.get("passcode") ?? "");

  if (!name) return { error: "Give this world a name." };
  if (!SLUG_RE.test(slug)) {
    return { error: "Slug can only use lowercase letters, numbers, and single hyphens (e.g. alex-and-sam)." };
  }
  if (!passcode.trim()) return { error: "Set a passcode for this couple." };

  const supabase = getSupabaseServerClient();

  // Friendly pre-check - the DB's UNIQUE constraint on slug is still the
  // real guarantee against a race, this just avoids a raw error message in
  // the common case of someone just trying an already-used slug.
  const existing = await supabase.from("worlds").select("id").eq("slug", slug).single();
  if (existing.data) {
    return { error: `The slug "${slug}" is already taken — pick another.` };
  }

  const { error } = await supabase.from("worlds").insert({
    name,
    slug,
    status: "active",
    access_code_hash: hashPasscode(passcode),
  });

  if (error) {
    return { error: "Something went wrong creating that world — please try again." };
  }

  revalidatePath("/admin");
  return { success: `Created "${name}" at /w/${slug}` };
}

export async function setWorldStatus(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "disabled", "archived"].includes(status)) return;

  const supabase = getSupabaseServerClient();
  await supabase.from("worlds").update({ status }).eq("id", id);

  revalidatePath("/admin");
}
