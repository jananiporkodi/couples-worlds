"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

const WORLD_PATH_RE = /^\/w\/([^/]+)/;

/**
 * Drop-in replacement for next/link that prefixes internal hrefs with the
 * current world's /w/{slug} - without this, every in-app link would bounce
 * through the un-prefixed path and get redirected by middleware (see
 * src/middleware.ts), losing the slug and forcing an extra round trip.
 *
 * The slug is read from the browser's actual URL via usePathname() (which
 * reflects the pre-rewrite path the user sees, unlike the x-world-slug
 * header which only exists server-side) - no context provider needed.
 *
 * Only rewrites relative/internal hrefs (starting with "/"); external URLs,
 * hashes, and hrefs that already start with /w/ are passed through as-is.
 */
const AppLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(function AppLink(
  { href, ...props },
  ref
) {
  const pathname = usePathname();
  const match = pathname?.match(WORLD_PATH_RE);
  const slug = match?.[1];

  let resolvedHref = href;
  if (slug && typeof href === "string" && href.startsWith("/") && !href.startsWith("/w/")) {
    resolvedHref = `/w/${slug}${href}`;
  }

  return <Link ref={ref} href={resolvedHref} {...props} />;
});

export default AppLink;
