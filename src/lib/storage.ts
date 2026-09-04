import "server-only";
import { getSupabaseServerClient } from "./supabase/server";
import { convertHeicIfNeeded } from "./heic";

export type StorageBucket = "memory-media" | "reference-photos";

/**
 * Uploads a File coming from a Server Action's FormData straight to Supabase
 * Storage, entirely server-side, and returns its public URL. Because uploads
 * happen here rather than in the browser, the client never needs a Supabase
 * key at all.
 *
 * iPhone photos (HEIC/HEIF) are auto-converted to JPEG here so they preview
 * correctly everywhere — browsers can't render HEIC natively.
 */
export async function uploadMediaFile(bucket: StorageBucket, file: File, folder = ""): Promise<string> {
  const supabase = getSupabaseServerClient();

  const isImage = file.type.startsWith("image/") || /\.(heic|heif|jpg|jpeg|png|webp|gif)$/i.test(file.name);
  const { buffer, contentType, ext } = isImage
    ? await convertHeicIfNeeded(file)
    : { buffer: Buffer.from(await file.arrayBuffer()), contentType: file.type || undefined, ext: file.name.split(".").pop() || "bin" };

  const path = `${folder ? `${folder}/` : ""}${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadManyMediaFiles(bucket: StorageBucket, files: File[], folder = ""): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    urls.push(await uploadMediaFile(bucket, file, folder));
  }
  return urls;
}
