import { getMemories, getPlans, getBucketItems, getPlaces, getPartnerNames } from "@/lib/data";
import MemoriesClient from "@/components/memories/MemoriesClient";

export const dynamic = "force-dynamic";

export default async function MemoriesPage({
  searchParams,
}: {
  searchParams: { open?: string };
}) {
  const [memories, plans, bucketItems, places, partnerNames] = await Promise.all([
    getMemories(),
    getPlans(),
    getBucketItems(),
    getPlaces(),
    getPartnerNames(),
  ]);

  return (
    <MemoriesClient
      memories={memories}
      plans={plans}
      bucketItems={bucketItems}
      places={places}
      partnerNames={partnerNames}
      initialOpenId={searchParams.open ?? null}
    />
  );
}
