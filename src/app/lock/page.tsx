import { Suspense } from "react";
import { cookies } from "next/headers";
import LockScreen from "./LockScreen";
import { getSettingsMap } from "@/lib/data";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LockPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const settings = await getSettingsMap();
  const partnerNames = {
    a: (settings.partner_a_name as string) || "Partner A",
    b: (settings.partner_b_name as string) || "Partner B",
  };
  const savedPartnerRaw = cookies().get(PARTNER_COOKIE_NAME)?.value;
  const savedPartner = isValidPartnerId(savedPartnerRaw) ? savedPartnerRaw : null;

  return (
    <Suspense fallback={null}>
      <LockScreen redirectTo={searchParams.from || "/"} partnerNames={partnerNames} savedPartner={savedPartner} />
    </Suspense>
  );
}
