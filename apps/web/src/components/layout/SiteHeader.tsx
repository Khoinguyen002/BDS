"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

type SiteHeaderProps = {
  /** Tên thương hiệu hiển thị bên trái (agent brand hoặc tên platform). */
  brandName: string;
  /** Đích của logo/back — landing của agent (/vi/slug) hoặc home platform (/vi). */
  homeHref: string;
};

// Header chung sticky + auto-hide. Trên trang landing (pathname === homeHref) header
// fixed & trong suốt để đè lên hero; các trang khác sticky nền đặc (nằm trong flow nên
// nội dung tự xuống dưới, không bị che như mấy nút floating cũ).
export function SiteHeader({ brandName, homeHref }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  const isLanding = pathname === homeHref;

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y < 80) {
        setHidden(false);
      } else if (y > lastY + 4) {
        setHidden(true); // cuộn xuống → ẩn
      } else if (y < lastY - 4) {
        setHidden(false); // cuộn lên → hiện
      }
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      // gom vào rAF cho mượt, tránh setState mỗi event scroll
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        isLanding ? "fixed" : "sticky",
        // Luôn giữ nền blur. transition transform+opacity với easing expo-out cho mượt.
        "top-0 inset-x-0 z-50 will-change-transform motion-safe:transition-[transform,opacity] motion-safe:duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "bg-background/70 backdrop-blur-xl border-b border-border text-foreground",
        hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
    >
      <div className="container flex items-center justify-between gap-4 h-16">
        {/* Trái: back (khi không ở landing) + brand */}
        <div className="flex items-center gap-2 min-w-0">
          {!isLanding && (
            <Link
              href={homeHref}
              aria-label={t("back")}
              className="group inline-flex items-center justify-center h-9 w-9 -ml-1.5 rounded-md hover:bg-current/10 transition-colors shrink-0"
            >
              <ArrowLeftIcon
                weight="bold"
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              />
            </Link>
          )}
          <Link
            href={homeHref}
            className="font-semibold tracking-tight truncate text-base md:text-lg hover:opacity-80 transition-opacity"
          >
            {brandName}
          </Link>
        </div>

        {/* Phải: ngôn ngữ + theme */}
        <div className="flex items-center gap-2 shrink-0">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
