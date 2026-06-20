"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === "vi" ? "en" : "vi";
    const newPath = pathname.replace(new RegExp(`^/${locale}`), `/${nextLocale}`);
    router.replace(newPath);
  };

  return (
    <button
      onClick={toggleLocale}
      className="inline-flex items-center justify-center h-9 px-2.5 rounded-md border border-current/15 hover:bg-current/10 uppercase font-mono font-bold text-[11px] tracking-widest transition-colors active:scale-95"
      aria-label="Toggle language"
    >
      {locale}
    </button>
  );
}
