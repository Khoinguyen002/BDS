import React from "react";

type ThemeConfig = {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  borderRadius?: string | null;
  fontFamily?: string | null;
};

export function ThemeInjector({ theme }: { theme?: ThemeConfig | null }) {
  if (!theme) return null;

  const primary = theme.primaryColor || "#059669"; // default emerald – matches globals.css
  const secondary = theme.secondaryColor || "#475569"; // default slate-600 – matches globals.css
  const radius =
    theme.borderRadius === "none"
      ? "0"
      : theme.borderRadius === "sm"
      ? "0.125rem"
      : theme.borderRadius === "md"
      ? "0.375rem"
      : theme.borderRadius === "lg"
      ? "0.5rem"
      : theme.borderRadius === "full"
      ? "9999px"
      : "0"; // default: sharp (0px) unless CMS explicitly picks a radius

  const font = theme.fontFamily === "serif" ? "ui-serif, Georgia, serif" : "var(--font-geist-sans)";

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          --theme-primary: ${primary};
          --theme-secondary: ${secondary};
          --theme-radius: ${radius};
        }
        body {
          font-family: ${font};
        }
      `
    }} />
  );
}

