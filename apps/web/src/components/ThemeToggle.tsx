"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-current/15 hover:bg-current/10 transition-colors active:scale-95"
      aria-label="Toggle theme"
    >
      {/* Màu kế thừa từ header (trắng trên hero, foreground khi nền đặc) */}
      <MoonIcon weight="regular" className="w-4 h-4 block dark:hidden" />
      <SunIcon weight="regular" className="w-4 h-4 hidden dark:block" />
    </button>
  );
}
