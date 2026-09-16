import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  // x-world-slug is set by middleware on every /w/{slug}/... request (see
  // src/middleware.ts) - the logout button only ever posts here from within
  // an already-slug-prefixed page, so this header is always present in
  // practice, but fall back to the default world just in case.
  const slug = request.headers.get("x-world-slug") ?? "our-world";
  const url = new URL(`/w/${slug}/lock`, request.url);
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
