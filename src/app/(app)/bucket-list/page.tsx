import { getBucketItems } from "@/lib/data";
import BucketListClient from "@/components/bucket-list/BucketListClient";

export const dynamic = "force-dynamic";

export default async function BucketListPage() {
  const items = await getBucketItems();
  return <BucketListClient items={items} />;
}
