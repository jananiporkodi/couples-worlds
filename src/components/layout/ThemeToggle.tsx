"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("olw-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-sm shadow-sm border border-black/[0.06] dark:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/5 transition text-base"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
