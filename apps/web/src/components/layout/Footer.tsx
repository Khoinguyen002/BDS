import { useTranslations } from "next-intl";
import Link from "next/link";
import { FacebookLogoIcon, LinkedinLogoIcon, YoutubeLogoIcon } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold mb-4">{tFooter("bds_platform")}</h3>
            <p className="text-foreground-secondary text-sm mb-6 max-w-sm">
              {tFooter("brand_desc")}
            </p>
            <div className="flex items-center gap-4 text-foreground-secondary">
              <a href="#" aria-label="Facebook" className="hover:text-foreground transition-colors"><FacebookLogoIcon size={20} weight="fill" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground transition-colors"><LinkedinLogoIcon size={20} weight="fill" /></a>
              <a href="#" aria-label="YouTube" className="hover:text-foreground transition-colors"><YoutubeLogoIcon size={20} weight="fill" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-foreground-muted">{tFooter("category")}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-foreground-secondary hover:text-foreground transition-colors">{tNav("home")}</Link></li>
              <li><Link href="/apartments" className="text-foreground-secondary hover:text-foreground transition-colors">{tNav("apartments")}</Link></li>
              <li><Link href="/contact" className="text-foreground-secondary hover:text-foreground transition-colors">{tNav("contact")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-xs uppercase tracking-wider text-foreground-muted">{tFooter("contact")}</h4>
            <ul className="space-y-3 text-sm text-foreground-secondary">
              <li>{tFooter("contact_email")}</li>
              <li>Hotline: 1900 9999</li>
              <li>{tFooter("address_label")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-foreground-muted">
          <p>{tFooter("copyright")} © {new Date().getFullYear()} {tFooter("bds_platform")}.</p>
        </div>
      </div>
    </footer>
  );
}
