"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PARTNER_COOKIE_NAME, PARTNER_MAX_AGE_SECONDS, isValidPartnerId } from "@/lib/auth";

export async function updateSettings(formData: FormData) {
  const relationshipStartDate = String(formData.get("relationshipStartDate") ?? "").trim();
  const anniversaryDate = String(formData.get("anniversaryDate") ?? "").trim();
  const partnerAName = String(formData.get("partnerAName") ?? "").trim() || "Partner A";
  const partnerBName = String(formData.get("partnerBName") ?? "").trim() || "Partner B";
  const partnerABirthday = String(formData.get("partnerABirthday") ?? "").trim();
  const partnerBBirthday = String(formData.get("partnerBBirthday") ?? "").trim();
  const partnerAEmail = String(formData.get("partnerAEmail") ?? "").trim();
  const partnerBEmail = String(formData.get("partnerBEmail") ?? "").trim();

  const supabase = getSupabaseServerClient();

  const updates: { key: string; value: unknown }[] = [
    { key: "partner_a_name", value: partnerAName },
    { key: "partner_b_name", value: partnerBName },
  ];
  if (relationshipStartDate) updates.push({ key: "relationship_start_date", value: relationshipStartDate });
  if (anniversaryDate) updates.push({ key: "anniversary_date", value: anniversaryDate });
  if (partnerABirthday) updates.push({ key: "partner_a_birthday", value: partnerABirthday });
  if (partnerBBirthday) updates.push({ key: "partner_b_birthday", value: partnerBBirthday });
  if (partnerAEmail) updates.push({ key: "partner_a_email", value: partnerAEmail });
  if (partnerBEmail) updates.push({ key: "partner_b_email", value: partnerBEmail });

  for (const u of updates) {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/us");
  revalidatePath("/");
}

export async function updateAppearance(formData: FormData) {
  const theme = String(formData.get("theme") ?? "").trim();
  const fontPairing = String(formData.get("fontPairing") ?? "").trim();
  const cornerStyle = String(formData.get("cornerStyle") ?? "").trim();
  const motionEnabled = formData.get("motionEnabled") === "on";

  const supabase = getSupabaseServerClient();

  const updates: { key: string; value: unknown }[] = [{ key: "motion_enabled", value: motionEnabled }];
  if (theme) updates.push({ key: "theme", value: theme });
  if (fontPairing) updates.push({ key: "font_pairing", value: fontPairing });
  if (cornerStyle) updates.push({ key: "corner_style", value: cornerStyle });

  for (const u of updates) {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

/** Switches which partner this device is identified as - used for the "who's this" toggle from Settings. */
export async function setCurrentPartner(partner: string) {
  if (!isValidPartnerId(partner)) return;
  cookies().set(PARTNER_COOKIE_NAME, partner, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PARTNER_MAX_AGE_SECONDS,
    path: "/",
  });
  revalidatePath("/settings");
  revalidatePath("/");
}
