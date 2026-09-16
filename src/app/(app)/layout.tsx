import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getCurrentWorld } from "@/lib/world";

/**
 * Two checks happen here, not one:
 *  1. Is there a session at all, and does it still resolve to an *active*
 *     world? (getCurrentWorld handles this - see src/lib/world.ts.)
 *  2. Does that session's world actually match the /w/{slug} in the URL?
 *     Without this, a stale or copy-pasted cookie for World A would keep
 *     rendering World A's data under World B's URL. The slug comes from
 *     the `x-world-slug` header middleware sets on every /w/{slug}/...
 *     request (see src/middleware.ts) - every query itself is still scoped
 *     by the session cookie via the Neon shim, this is purely a routing
 *     guard on top of that.
 */
export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const slug = headers().get("x-world-slug");
  const world = await getCurrentWorld();

  if (!world || (slug && world.slug !== slug)) {
    redirect(`/w/${slug ?? world?.slug ?? "our-world"}/welcome`);
  }

  return <AppShell>{children}</AppShell>;
}
