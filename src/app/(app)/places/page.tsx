import { getPlaces, getMemories } from "@/lib/data";
import PlacesClient from "@/components/places/PlacesClient";

export const dynamic = "force-dynamic";

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: { place?: string };
}) {
  const [places, memories] = await Promise.all([getPlaces(), getMemories()]);
  return <PlacesClient places={places} memories={memories} initialSelectedId={searchParams.place ?? null} />;
}
