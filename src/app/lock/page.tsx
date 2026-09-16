import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import LockScreen from "./LockScreen";
import { getSettingsMap } from "@/lib/data";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LockPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const slug = headers().get("x-world-slug") ?? "our-world";
  const settings = await getSettingsMap();
  const partnerNames = {
    a: (settings.partner_a_name as string) || "Partner A",
    b: (settings.partner_b_name as string) || "Partner B",
  };
  const savedPartnerRaw = cookies().get(PARTNER_COOKIE_NAME)?.value;
  const savedPartner = isValidPartnerId(savedPartnerRaw) ? savedPartnerRaw : null;

  // searchParams.from is the slug-less path middleware captured when it
  // bounced an unauthenticated request here (see src/middleware.ts) -
  // re-prefix it with this world's slug so login lands back on the right
  // /w/{slug}/... URL.
  const redirectTo = `/w/${slug}${searchParams.from || "/"}`;

  return (
    <Suspense fallback={null}>
      <LockScreen
        slug={slug}
        redirectTo={redirectTo}
        partnerNames={partnerNames}
        savedPartner={savedPartner}
      />
    </Suspense>
  );
}
