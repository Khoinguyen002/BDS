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
      className="fixed bottom-6 right-[5.5rem] p-3.5 w-14 h-14 bg-background border border-border hover:border-border-strong shadow-sm hover:shadow-md transition-all duration-200 z-50 flex items-center justify-center uppercase font-mono font-bold text-xs tracking-widest text-foreground-secondary hover:text-foreground active:scale-95"
      aria-label="Toggle language"
    >
      {locale}
    </button>
  );
}
