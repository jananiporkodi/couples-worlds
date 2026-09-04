import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Page background (very light warm-gray) vs card surface (pure white).
        cream: "#FAFAF8",
        paper: "#FFFFFF",
        // "peach"/"blush" mirror the couple's chosen accent color (see --color-accent*
        // custom properties in globals.css, set per theme). Not literally peach/blush
        // hues anymore - names kept to avoid a wider rename across the app.
        peach: { DEFAULT: "rgb(var(--color-accent-soft) / <alpha-value>)", deep: "rgb(var(--color-accent) / <alpha-value>)" },
        // "sage" is a neutral warm-gray, used for calm/done states - not theme-affected.
        sage: { DEFAULT: "#F0EFEB", deep: "#8B8B85" },
        // "lavender" is a neutral gray, used for tags/chips - not theme-affected.
        lavender: { DEFAULT: "#F1F1EF", deep: "#4A4A48" },
        blush: { DEFAULT: "rgb(var(--color-accent-soft) / <alpha-value>)", deep: "rgb(var(--color-accent) / <alpha-value>)" },
        // Explicit accent token, driven by the couple's chosen theme.
        accent: { DEFAULT: "rgb(var(--color-accent) / <alpha-value>)", soft: "rgb(var(--color-accent-soft) / <alpha-value>)" },
        ink: { DEFAULT: "#232323", soft: "#6E6E6C" },
        bezel: "#232323",
        "cream-dark": "#141414",
        "paper-dark": "#1C1C1C",
      },
      fontFamily: {
        // These resolve to whichever fonts the couple's chosen pairing maps them to
        // (see --font-role-* custom properties, set on <html> in the root layout).
        hand: ["var(--font-role-hand)", "cursive"],
        patrick: ["var(--font-role-patrick)", "cursive"],
        sans: ["var(--font-role-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(10deg)" },
        },
        popIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        popIn: "popIn 0.35s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
