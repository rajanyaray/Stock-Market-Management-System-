"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 60, height: 30 }} />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      className={`theme-toggle${isDark ? "" : " light-mode"}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle-knob">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
