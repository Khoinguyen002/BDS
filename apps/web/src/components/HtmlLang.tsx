"use client";

import { useEffect } from "react";

// Đồng bộ <html lang> theo locale khi điều hướng client (soft-nav),
// vì <html> nằm ở root layout (không re-render theo locale).
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
