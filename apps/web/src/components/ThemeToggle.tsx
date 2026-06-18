"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react/dist/ssr";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 p-3.5 w-14 h-14 bg-background border border-border hover:border-border-strong shadow-sm hover:shadow-md transition-all duration-200 z-50 flex items-center justify-center group active:scale-95"
      aria-label="Toggle theme"
    >
      <MoonIcon
        weight="regular"
        className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors block dark:hidden"
      />
      <SunIcon
        weight="regular"
        className="w-5 h-5 text-zinc-400 group-hover:text-zinc-50 transition-colors hidden dark:block"
      />
    </button>
  );
}
