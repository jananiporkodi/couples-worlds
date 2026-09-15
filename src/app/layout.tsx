import type { Metadata, Viewport } from "next";
import { Caveat, Patrick_Hand, Quicksand, Playfair_Display, Lora, Baloo_2, Work_Sans } from "next/font/google";
import "./globals.css";
import { getSettingsMap } from "@/lib/data";
import { getTheme, getFontPairing, fontRoleStyle, DEFAULT_CORNER_STYLE, DEFAULT_MOTION_ENABLED } from "@/lib/appearance";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-baloo",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-worksans",
});

export const metadata: Metadata = {
  title: "Our Little World",
  description: "A private home for our memories, dreams, and everything in between.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Our World",
  },
};

export const viewport: Viewport = {
  themeColor: "#C1443A",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettingsMap().catch(() => ({}) as Record<string, unknown>);
  const theme = getTheme(settings.theme as string | undefined);
  const fontPairing = getFontPairing(settings.font_pairing as string | undefined);
  const cornerStyle = (settings.corner_style as string | undefined) ?? DEFAULT_CORNER_STYLE;
  const motionEnabled = settings.motion_enabled === undefined ? DEFAULT_MOTION_ENABLED : settings.motion_enabled !== false;

  const fontVars = `${caveat.variable} ${patrickHand.variable} ${quicksand.variable} ${playfair.variable} ${lora.variable} ${baloo.variable} ${workSans.variable}`;

  return (
    <html
      lang="en"
      className={fontVars}
      data-theme={theme.key}
      data-corner={cornerStyle}
      data-motion={motionEnabled ? "on" : "off"}
      style={fontRoleStyle(fontPairing) as unknown as React.CSSProperties}
    >
      <body className="font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('olw-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
              try {
                if ('clearAppBadge' in navigator) {
                  navigator.clearAppBadge();
                  document.addEventListener('visibilitychange', function () {
                    if (document.visibilityState === 'visible') navigator.clearAppBadge();
                  });
                }
              } catch (e) {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
