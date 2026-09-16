import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Phase 3 - each couple gets their own URL: /w/{slug}/... Rather than
 * duplicate every page file under a [slug] directory, the actual route
 * files stay exactly where they were (src/app/(app)/..., src/app/lock,
 * src/app/welcome) and this middleware rewrites /w/{slug}/foo to /foo
 * internally, passing the slug through as a header (`x-world-slug`) so
 * server code - the (app) layout's session check, and the lock screen's
 * passcode check - can tell which world's URL a request came in on. See
 * src/app/(app)/layout.tsx and src/app/lock/actions.ts.
 *
 * DEFAULT_WORLD_SLUG exists only for backward compatibility: anyone with an
 * old bookmark to a bare path (the whole app, before this migration, or
 * just "/") gets bounced to the same path under this slug. There's only
 * one couple today, so this is unambiguous; Phase 4's public landing page
 * will replace the "/" case, and the old-bookmark case can be deleted once
 * nobody has those links anymore.
 */
const DEFAULT_WORLD_SLUG = "our-world";

const WORLD_PATH_RE = /^\/w\/([^/]+)(\/.*)?$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const worldMatch = pathname.match(WORLD_PATH_RE);

  if (!worldMatch) {
    const rest = pathname === "/" ? "" : pathname;
    const target = new URL(`/w/${DEFAULT_WORLD_SLUG}${rest}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  const slug = worldMatch[1];
  const rest = worldMatch[2] || "/";

  const isPublicRest = rest.startsWith("/lock") || rest.startsWith("/welcome");
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!isPublicRest && !sessionCookie) {
    const welcomeUrl = new URL(`/w/${slug}/welcome`, request.url);
    welcomeUrl.searchParams.set("from", rest);
    return NextResponse.redirect(welcomeUrl);
  }

  const rewriteUrl = new URL(rest, request.url);
  rewriteUrl.search = request.nextUrl.search;
  const headers = new Headers(request.headers);
  headers.set("x-world-slug", slug);
  return NextResponse.rewrite(rewriteUrl, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)"],
};
