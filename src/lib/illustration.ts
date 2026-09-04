import { BUCKET_CATEGORIES } from "./types";

const CATEGORY_MOODS: Record<string, string> = {
  travel: "an adventurous travel scene with warm golden-hour light",
  city: "a lively city backdrop with string lights and cozy storefronts",
  home: "a cozy home interior with soft lamp light and warm textures",
  food: "a charming little restaurant or street food stall scene",
  movies: "a cozy living room or retro cinema with warm glowing screen light",
  rainy_day: "a rainy, misty scene with umbrellas and warm window light",
  friends: "a cheerful group scene with warm string lights and laughter",
  celebrations: "a festive, confetti-filled celebration scene",
  random: "a whimsical, unexpected adventure scene",
  romantic: "a dreamy, intimate scene with soft warm lighting and floating light particles",
};

/**
 * Builds a text-to-image prompt for a bucket-list illustration in the app's
 * house style (Studio Ghibli / Tangled-inspired, warm and painterly).
 *
 * This function only builds the *prompt* — wiring it up to an actual image
 * generation API (OpenAI Images, Replicate, fal.ai, Stability, etc.) is left
 * as a plug-in point. See README "Illustration generation" for how to
 * connect one, and where to upload the two reference photos so generations
 * stay visually consistent with "us."
 */
export function buildIllustrationPrompt(
  title: string,
  category: string,
  description?: string | null
): string {
  const categoryMeta = BUCKET_CATEGORIES.find((c) => c.key === category);
  const moodHint = CATEGORY_MOODS[category] ?? "a warm, cozy scene";
  const label = categoryMeta?.label ?? category;

  return [
    `A cute Studio Ghibli-inspired illustration of the same couple shown in the two reference photos —`,
    `keep their faces, hair, and skin tone consistent with the references.`,
    `They are ${title.toLowerCase()}${description ? `: ${description}` : ""}.`,
    `Setting: ${moodHint}, category "${label}".`,
    `Style: soft painterly linework, warm color palette (cream, peach, sage, lavender), gentle rim lighting,`,
    `rounded friendly shapes, a little magical and nostalgic, like a page from a hand-illustrated scrapbook.`,
    `No text, no watermark.`,
  ].join(" ");
}
