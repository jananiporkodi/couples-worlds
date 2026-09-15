export interface NavItem {
  href: string;
  label: string;
  emoji: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", emoji: "🏡" },
  { href: "/memories", label: "Memories", emoji: "📸" },
  { href: "/plans", label: "Calendar", emoji: "🗓" },
  { href: "/todos", label: "To-do", emoji: "☑" },
  { href: "/bucket-list", label: "Bucket list", emoji: "🪣" },
  { href: "/expenses", label: "Expenses", emoji: "💰" },
  { href: "/places", label: "Places", emoji: "📍" },
  { href: "/gallery", label: "Gallery", emoji: "🖼" },
  { href: "/timeline", label: "Timeline", emoji: "📅" },
  { href: "/notes", label: "Love Jar", emoji: "🫙" },
];

// Bottom nav on mobile only has room for a handful of icons; the rest live behind "More".
export const BOTTOM_NAV_PRIMARY = ["/", "/memories", "/todos", "/plans"];
