import React from "react";

type ThemeConfig = {
  primaryColor?: string | null;
  borderRadius?: string | null;
  fontFamily?: string | null;
};

export function ThemeInjector({ theme }: { theme?: ThemeConfig | null }) {
  if (!theme) return null;

  const primary = theme.primaryColor || "#2563eb"; // default blue
  const radius =
    theme.borderRadius === "none"
      ? "0"
      : theme.borderRadius === "sm"
      ? "0.125rem"
      : theme.borderRadius === "md"
      ? "0.375rem"
      : theme.borderRadius === "full"
      ? "9999px"
      : "0.5rem"; // lg is default

  const font = theme.fontFamily === "serif" ? "ui-serif, Georgia, serif" : "var(--font-geist-sans)";

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --theme-primary: ${primary};
          --theme-radius: ${radius};
        }
        body {
          font-family: ${font};
        }
      `
    }} />
  );
}
