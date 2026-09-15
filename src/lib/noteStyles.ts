/**
 * Hand-drawn-doodle-style frames for Love Jar notes - a dashed/dotted border plus a
 * small original SVG decoration (clip, paper plane, sun, bow, or hanging stars).
 * Picked deterministically from the note's id so a given note always keeps the same
 * "skin" (and the card + its open modal always match), while the grid as a whole
 * cycles through a handful of looks for variety.
 */
export type NoteDoodleVariant = "clip" | "planeHearts" | "sunCloud" | "bowDots" | "moonStars";

export type NoteStyle = {
  bg: string;
  borderClass: string;
  lineColor: string;
  doodle: NoteDoodleVariant;
};

export const NOTE_STYLES: NoteStyle[] = [
  { bg: "#FFFDF8", borderClass: "border-2 border-dashed border-[#4a3c3c] rounded-xl", lineColor: "rgba(74,60,60,0.08)", doodle: "clip" },
  { bg: "#FFFDF8", borderClass: "border-2 border-dashed border-[#4a3c3c] rounded-2xl", lineColor: "rgba(74,60,60,0.08)", doodle: "planeHearts" },
  { bg: "#F5FAFF", borderClass: "border-2 border-[#8FC1E8] rounded-[28px]", lineColor: "rgba(56,100,140,0.08)", doodle: "sunCloud" },
  { bg: "#FFF7FA", borderClass: "border-2 border-dotted border-[#F3AFC1] rounded-2xl", lineColor: "rgba(140,60,90,0.08)", doodle: "bowDots" },
  { bg: "#FFFDF3", borderClass: "border-2 border-dashed border-[#E8CB74] rounded-2xl", lineColor: "rgba(140,110,30,0.08)", doodle: "moonStars" },
];

export function styleForId(id: string): NoteStyle {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return NOTE_STYLES[hash % NOTE_STYLES.length];
}
