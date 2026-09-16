"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_MAX_AGE_SECONDS,
  verifyAdminPasscode,
  adminSessionCookieValue,
} from "@/lib/admin-auth";

export interface AdminLoginState {
  error?: string;
}

export async function adminLogin(_prevState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const passcode = String(formData.get("passcode") ?? "");

  if (!verifyAdminPasscode(passcode)) {
    return { error: "That's not it — try again." };
  }

  // path: "/admin" keeps this cookie completely separate from any world's
  // session cookie (which is path "/") - the browser will never send this
  // one to a /w/{slug}/... request, and vice versa.
  cookies().set(ADMIN_SESSION_COOKIE_NAME, adminSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_MAX_AGE_SECONDS,
    path: "/admin",
  });

  redirect("/admin");
}
