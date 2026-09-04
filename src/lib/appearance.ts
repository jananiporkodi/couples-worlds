/**
 * Central source of truth for the small, curated set of themes and font pairings a couple
 * can choose from in Settings -> Appearance. Deliberately NOT an open color picker / font
 * list - a handful of polished, pre-designed combinations only. Used both by the root
 * layout (to apply the chosen look) and by the Appearance settings UI (to render pickers
 * with accurate live previews).
 */

export interface ThemeOption {
  key: string;
  label: string;
  /** "R G B" triples (no commas, no rgb() wrapper) so Tailwind's rgb(var(--x) / <alpha-value>) pattern works. */
  accentRgb: string;
  accentSoftRgb: string;
  /** Hex swatches, only for rendering the little color dot in the picker UI. */
  swatchHex: string;
}

export const THEMES: ThemeOption[] = [
  { key: "classic", label: "Classic Love", accentRgb: "193 68 58", accentSoftRgb: "246 222 220", swatchHex: "#C1443A" },
  { key: "sage", label: "Sage", accentRgb: "107 143 113", accentSoftRgb: "231 239 231", swatchHex: "#6B8F71" },
  { key: "lavender", label: "Lavender", accentRgb: "138 124 168", accentSoftRgb: "239 234 245", swatchHex: "#8A7CA8" },
  { key: "midnight", label: "Midnight", accentRgb: "44 62 100", accentSoftRgb: "228 232 240", swatchHex: "#2C3E64" },
  { key: "blush", label: "Blush", accentRgb: "201 123 139", accentSoftRgb: "247 233 236", swatchHex: "#C97B8B" },
];

export const DEFAULT_THEME = "classic";

export function getTheme(key: string | undefined): ThemeOption {
  return THEMES.find((t) => t.key === key) ?? THEMES.find((t) => t.key === DEFAULT_THEME)!;
}

export interface FontPairing {
  key: string;
  label: string;
  description: string;
  /** Which loaded font variable each semantic role should point to. */
  handVar: string;
  patrickVar: string;
  sansVar: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    key: "journal",
    label: "Journal",
    description: "Clean body font, subtle handwritten touches for notes and memories.",
    handVar: "var(--font-caveat)",
    patrickVar: "var(--font-patrick)",
    sansVar: "var(--font-quicksand)",
  },
  {
    key: "modern",
    label: "Modern",
    description: "Clean sans-serif throughout.",
    handVar: "var(--font-quicksand)",
    patrickVar: "var(--font-quicksand)",
    sansVar: "var(--font-quicksand)",
  },
  {
    key: "elegant",
    label: "Elegant",
    description: "Elegant serif headings, clean sans-serif body.",
    handVar: "var(--font-playfair)",
    patrickVar: "var(--font-quicksand)",
    sansVar: "var(--font-quicksand)",
  },
  {
    key: "soft",
    label: "Soft",
    description: "Rounded, friendly sans-serif.",
    handVar: "var(--font-baloo)",
    patrickVar: "var(--font-baloo)",
    sansVar: "var(--font-baloo)",
  },
  {
    key: "classic",
    label: "Classic",
    description: "Traditional serif headings, minimal sans-serif UI text.",
    handVar: "var(--font-lora)",
    patrickVar: "var(--font-worksans)",
    sansVar: "var(--font-worksans)",
  },
];

export const DEFAULT_FONT_PAIRING = "journal";

export function getFontPairing(key: string | undefined): FontPairing {
  return FONT_PAIRINGS.find((f) => f.key === key) ?? FONT_PAIRINGS.find((f) => f.key === DEFAULT_FONT_PAIRING)!;
}

/** Inline style to put on an element (usually <html>) so `font-hand`/`font-patrick`/`font-sans` resolve to this pairing's fonts. */
export function fontRoleStyle(pairing: FontPairing): Record<string, string> {
  return {
    "--font-role-hand": pairing.handVar,
    "--font-role-patrick": pairing.patrickVar,
    "--font-role-sans": pairing.sansVar,
  };
}

export const CORNER_STYLES = [
  { key: "soft", label: "Soft rounded" },
  { key: "classic", label: "Classic" },
];
export const DEFAULT_CORNER_STYLE = "soft";

export const DEFAULT_MOTION_ENABLED = true;
