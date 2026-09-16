import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const url = new URL("/admin/lock", request.url);
  const response = NextResponse.redirect(url);
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", { path: "/admin", maxAge: 0 });
  return response;
}
