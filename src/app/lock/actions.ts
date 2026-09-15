"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  isValidPartnerId,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  PARTNER_COOKIE_NAME,
  PARTNER_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { verifyPasscodeAndGetWorld } from "@/lib/world";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const passcode = String(formData.get("passcode") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");
  const partner = String(formData.get("partner") ?? "");

  const world = await verifyPasscodeAndGetWorld(passcode);
  if (!world) {
    return { error: "That's not quite it — try again." };
  }

  cookies().set(SESSION_COOKIE_NAME, world.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  if (isValidPartnerId(partner)) {
    cookies().set(PARTNER_COOKIE_NAME, partner, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: PARTNER_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  redirect(redirectTo || "/");
}
