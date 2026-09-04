import { getGalleryMedia } from "@/lib/data";
import GalleryClient from "@/components/gallery/GalleryClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const media = await getGalleryMedia();
  return <GalleryClient media={media} />;
}
