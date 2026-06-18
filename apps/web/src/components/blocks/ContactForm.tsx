import type { LandingPage, User } from "@bds/shared/payload-types";
import { getTranslations } from "next-intl/server";
import { PhoneIcon, ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatedSection } from "@/components/AnimatedSection";

export default async function ContactForm(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "contactForm" }
  > & { ownerId?: number | User },
) {
  const { title, placeholder } = props;
  const t = await getTranslations("contact");

  return (
    <section className="py-24 px-4 md:px-8 bg-background-subtle border-t border-border relative overflow-hidden">
      <div className="relative max-w-5xl mx-auto">
        <div className="bg-background border border-border p-8 md:p-16 flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Text Content */}
          <AnimatedSection direction="up" className="w-full md:w-5/12 flex flex-col gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-medium mb-4 text-foreground tracking-tight leading-[1.1]">
                {title || t("title")}
              </h2>
              <p className="text-foreground-secondary text-base leading-relaxed">
                {placeholder || t("description")}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <PhoneIcon weight="regular" className="w-4 h-4" />
                </div>
                <span className="text-foreground-secondary text-sm font-medium">
                  {t("support_247")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: "var(--theme-primary)" }}
                >
                  <ShieldCheckIcon weight="regular" className="w-4 h-4" />
                </div>
                <span className="text-foreground-secondary text-sm font-medium">
                  {t("security")}
                </span>
              </div>
            </div>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection delay={0.2} direction="up" className="w-full md:w-7/12">
            <form className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2"
                >
                  {t("full_name")}
                </label>
                <input
                  type="text"
                  id="contact-name"
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-[var(--theme-primary)] text-foreground placeholder:text-foreground-muted text-sm"
                  placeholder={t("full_name_placeholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2"
                >
                  {t("phone_number")}
                </label>
                <input
                  type="tel"
                  id="contact-phone"
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-[var(--theme-primary)] text-foreground placeholder:text-foreground-muted text-sm"
                  placeholder={t("phone_placeholder")}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2"
                >
                  {t("email_optional")}
                </label>
                <input
                  type="email"
                  id="contact-email"
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-[var(--theme-primary)] text-foreground placeholder:text-foreground-muted text-sm"
                  placeholder={t("email_placeholder")}
                />
              </div>

              <button
                type="button"
                className="w-full py-4 text-white text-sm font-semibold uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-2"
                style={{ backgroundColor: "var(--theme-primary)" }}
              >
                {t("submit_button")}
              </button>
            </form>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
