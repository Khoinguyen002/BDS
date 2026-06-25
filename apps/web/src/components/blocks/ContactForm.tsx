"use client";

import type { LandingPage, User } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import { ShieldCheckIcon, StarIcon, ChatCircleTextIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { submitLead } from "@/app/actions/lead";
import { toast } from "sonner";
import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default function ContactForm(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "contactForm" }
  > & { ownerId?: number | User | null },
) {
  const { title, placeholder, ownerId } = props;
  const t = useTranslations("contact");
  
  const [cfToken, setCfToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cfToken) {
      toast.error(t("captcha_required") || "Vui lòng xác thực CAPTCHA");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("cfTurnstileResponse", cfToken);
    
    // Extract ID if ownerId is an object
    if (ownerId) {
      const id = typeof ownerId === 'object' && ownerId !== null ? ownerId.id : ownerId;
      formData.set("ownerId", String(id));
    }

    const res = await submitLead(formData);
    setIsLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(t("submit_success") || "Gửi thông tin thành công!");
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <section className="py-24 bg-background-subtle border-t border-border relative overflow-hidden">
      <div className="container relative max-w-5xl">
        <div className="bg-background border border-border p-8 md:p-16 flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* Text Content */}
          <AnimatedSection direction="up" className="w-full md:w-5/12 flex flex-col gap-8">
            <div>
              <h2 className="mb-4">
                {title || t("title")}
              </h2>
              <p className="text-foreground-secondary text-base leading-relaxed">
                {placeholder || t("description")}
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center text-white shrink-0 bg-primary"
                >
                  <ClockIcon weight="fill" className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground font-semibold">
                    {t("response_time") || "Phản hồi trong 30 phút"}
                  </span>
                  <span className="text-foreground-muted text-sm">
                    {t("support_247")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center text-white shrink-0 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <ShieldCheckIcon weight="fill" className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground font-semibold">
                    {t("security_title") || "Giao dịch an toàn"}
                  </span>
                  <span className="text-foreground-muted text-sm">
                    {t("security")}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2 text-yellow-500">
                  <StarIcon weight="fill" className="w-5 h-5" />
                  <StarIcon weight="fill" className="w-5 h-5" />
                  <StarIcon weight="fill" className="w-5 h-5" />
                  <StarIcon weight="fill" className="w-5 h-5" />
                  <StarIcon weight="fill" className="w-5 h-5" />
                  <span className="text-foreground font-bold ml-1">5.0</span>
                </div>
                <p className="text-sm text-foreground-secondary">
                  {t("rating_text") || "Từ hơn 120+ khách hàng đã giao dịch thành công."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-8 px-3 text-xs font-medium uppercase tracking-wider">
                  <a href="https://zalo.me" target="_blank" rel="noreferrer">
                    <ChatCircleTextIcon weight="fill" className="w-4 h-4 mr-1.5" />
                    Zalo
                  </a>
                </Button>
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-8 px-3 text-xs font-medium uppercase tracking-wider">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection delay={0.2} direction="up" className="w-full md:w-7/12">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-2"
                >
                  {t("full_name")}
                </label>
                <input
                  type="text"
                  name="name"
                  id="contact-name"
                  required
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-(--theme-primary) text-foreground placeholder:text-foreground-muted text-sm"
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
                  name="phone"
                  id="contact-phone"
                  required
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-(--theme-primary) text-foreground placeholder:text-foreground-muted text-sm"
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
                  name="email"
                  id="contact-email"
                  className="w-full px-4 py-3.5 border border-border bg-background outline-none transition-all focus:border-(--theme-primary) text-foreground placeholder:text-foreground-muted text-sm"
                  placeholder={t("email_placeholder")}
                />
              </div>
              
              <div className="mt-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                  onSuccess={(token) => setCfToken(token)}
                  options={{ theme: "auto" }}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-sm uppercase tracking-wider mt-2 py-6 flex items-center justify-center"
              >
                {isLoading ? <Spinner className="w-5 h-5 animate-spin" /> : t("submit_button")}
              </Button>
            </form>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
