import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname.startsWith("/lock") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/login") ||
    pathname === "/favicon.ico";

  if (isPublicPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // This only checks that *some* world session is present. It used to
  // compare the cookie directly against the shared APP_PASSCODE env var, but
  // the cookie now holds a signed-in world's id, not the passcode (see
  // src/lib/world.ts). Whether that id still resolves to a real, *active*
  // world (as opposed to one that's been disabled/archived) needs a DB
  // lookup, which happens in the (app) route group's layout via
  // getCurrentWorldId() - not here, since Edge middleware is the wrong place
  // to add a database dependency for every request.
  if (!sessionCookie) {
    const welcomeUrl = new URL("/welcome", request.url);
    welcomeUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(welcomeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)"],
};
