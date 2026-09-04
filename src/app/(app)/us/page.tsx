import { getStats, getSettingsMap, getLoveJarEntries, getAutoCountdowns } from "@/lib/data";
import UsClient from "@/components/us/UsClient";

export const dynamic = "force-dynamic";

export default async function UsPage() {
  const [stats, settings, loveJar] = await Promise.all([
    getStats(),
    getSettingsMap(),
    getLoveJarEntries(),
  ]);

  const autoCountdowns = getAutoCountdowns(settings);

  return <UsClient stats={stats} settings={settings} loveJar={loveJar} autoCountdowns={autoCountdowns} />;
}
