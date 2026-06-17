"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 p-4 rounded-full bg-white dark:bg-zinc-800 shadow-xl border border-zinc-200 dark:border-zinc-700 hover:scale-110 transition-all z-50 flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      {/* Hiển thị Moon ở Light Mode, ẩn ở Dark Mode */}
      <Moon className="w-6 h-6 text-gray-700 group-hover:-rotate-12 transition-transform duration-300 block dark:hidden" />
      
      {/* Hiển thị Sun ở Dark Mode, ẩn ở Light Mode */}
      <Sun className="w-6 h-6 text-yellow-500 group-hover:rotate-45 transition-transform duration-300 hidden dark:block" />
    </button>
  );
}
