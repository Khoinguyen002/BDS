"use client";

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
  /** Hiển thị logo platform thay vì text */
  showPlatformLogo?: boolean;
  /** Node logo truyền từ server xuống (nếu có CMS upload) */
  logoNode?: React.ReactNode;
};

// Header chung sticky + auto-hide. Trên trang landing (pathname === homeHref) header
// fixed & trong suốt để đè lên hero; các trang khác sticky nền đặc (nằm trong flow nên
// nội dung tự xuống dưới, không bị che như mấy nút floating cũ).
export function SiteHeader({
  brandName,
  homeHref,
  showPlatformLogo,
  logoNode,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  const isLanding = pathname === homeHref;

  return (
    <header
      className={[
        // Fixed ở mọi trang → ở home nó frosted blur ngay trên hero. Nền translucent
        // + backdrop-blur để hút blur từ nội dung/hero phía sau, phủ thêm gradient nhẹ
        // pha primary → secondary của agent.
        "fixed top-0 inset-x-0 z-50",
        "bg-background/60 backdrop-blur-xl bg-linear-to-r from-secondary/30 via-primary/10 to-primary/30 text-foreground border-b border-border",
      ].join(" ")}
    >
      <div className="container flex items-center justify-between gap-4 h-(--header-h)">
        {/* Trái: back (khi không ở landing) + brand */}
        <div className="flex items-center gap-2 min-w-0">
          {!isLanding && (
            <Link
              href={homeHref}
              aria-label={t("back")}
              className="group inline-flex items-center justify-center h-9 w-9 -ml-1.5 hover:bg-current/10 transition-colors shrink-0"
            >
              <ArrowLeftIcon
                weight="bold"
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              />
            </Link>
          )}
          <Link
            href={homeHref}
            className="flex items-center hover:opacity-80 transition-opacity"
            aria-label={brandName}
          >
            {showPlatformLogo && logoNode ? (
              logoNode
            ) : (
              <span className="font-semibold tracking-tight truncate text-base md:text-lg">
                {brandName}
              </span>
            )}
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
