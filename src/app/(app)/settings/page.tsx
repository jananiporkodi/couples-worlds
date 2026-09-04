import { cookies } from "next/headers";
import { getSettingsMap } from "@/lib/data";
import { PARTNER_COOKIE_NAME, isValidPartnerId } from "@/lib/auth";
import SettingsTabs from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettingsMap();
  const savedPartnerRaw = cookies().get(PARTNER_COOKIE_NAME)?.value;
  const currentPartner = isValidPartnerId(savedPartnerRaw) ? savedPartnerRaw : null;
  return <SettingsTabs settings={settings} currentPartner={currentPartner} />;
}
