import "server-only";
import { getSupabaseServerClient } from "./supabase/server";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

/**
 * Generates a bucket-list illustration via OpenAI's image API and re-hosts
 * it on our own Supabase storage (OpenAI's returned URLs/base64 aren't
 * durably hosted). Returns null on any failure — missing API key, request
 * error, upload error — so a bucket item's creation is never blocked on
 * this. Callers should fall back to a simple category-emoji tile when this
 * returns null.
 */
export async function generateBucketArtwork(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024", n: 1 }),
    });
    if (!response.ok) {
      console.error("Bucket artwork generation failed:", response.status, await response.text().catch(() => ""));
      return null;
    }
    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json as string | undefined;
    const remoteUrl = data?.data?.[0]?.url as string | undefined;

    let imageBuffer: Buffer;
    if (b64) {
      imageBuffer = Buffer.from(b64, "base64");
    } else if (remoteUrl) {
      const imgRes = await fetch(remoteUrl);
      if (!imgRes.ok) return null;
      imageBuffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      return null;
    }

    const supabase = getSupabaseServerClient();
    const path = `bucket-list/${crypto.randomUUID()}.png`;
    const { error } = await supabase.storage.from("memory-media").upload(path, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });
    if (error) {
      console.error("Failed to store generated bucket artwork:", error);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from("memory-media").getPublicUrl(path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Bucket artwork generation threw an error, falling back:", err);
    return null;
  }
}
