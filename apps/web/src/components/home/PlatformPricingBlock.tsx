import { getTranslations } from "next-intl/server";
import { getPlans } from "@/lib/payload-fetcher";
import { Check } from "@phosphor-icons/react/dist/ssr";

import type { Plan } from "@bds/shared/payload-types";

interface PlatformPricingBlockProps {
  title?: string;
  description?: string;
  locale: string;
  plansList?: { id?: string; plan?: string | Plan }[] | null;
}

export default async function PlatformPricingBlock({ title, description, locale, plansList }: PlatformPricingBlockProps) {
  const t = await getTranslations("common");

  let plans: Plan[] = [];

  // If plansList is explicitly provided via CMS block (array of items)
  if (plansList && plansList.length > 0) {
    plans = plansList
      .filter((item) => item.plan && typeof item.plan === "object")
      .map((item) => item.plan as Plan);
  } else {
    // Fallback: fetch all plans and sort custom to the end
    const fetchedPlans = await getPlans(locale);
    plans = [...fetchedPlans].sort((a, b) => {
      if (a.slug === "custom") return 1;
      if (b.slug === "custom") return -1;
      return 0; // maintain original sort (by price) for others
    });
  }

  const blockTitle = title || t("pricing.title");
  const blockDescription = description || t("pricing.description");

  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            {blockTitle}
          </h2>
          <p className="text-lg text-foreground-muted leading-relaxed">
            {blockDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isPopular = plan.slug === "starter";
            
            return (
              <div 
                key={plan.id} 
                className={`relative border flex flex-col p-6 transition-colors duration-300 ${
                  isPopular 
                    ? "border-primary bg-card" 
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-medium px-3 py-1 tracking-widest uppercase">
                    {t("pricing.most_popular")}
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-2 text-foreground">{plan.name}</h3>
                
                <div className="mb-6">
                  {plan.originalPrice ? (
                    <div className="text-sm text-foreground-muted line-through mb-1">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(plan.originalPrice)}
                    </div>
                  ) : (
                    <div className="h-5 mb-1" /> // Spacer
                  )}
                  <div className="flex items-baseline gap-1">
                    {plan.price === 0 && plan.slug !== "custom" ? (
                      <span className="text-3xl font-mono tracking-tight font-bold text-foreground">
                        0 đ
                      </span>
                    ) : plan.slug === "custom" ? (
                      <span className="text-2xl font-semibold text-foreground">
                        {t("pricing.custom_price")}
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-mono tracking-tight font-bold text-foreground">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(plan.price)}
                        </span>
                        <span className="text-foreground-muted text-sm">/{t("pricing.month")}</span>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  className={`w-full py-3 px-6 mb-8 font-medium transition-all duration-200 ${
                    isPopular 
                      ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]" 
                      : "border border-border text-foreground hover:bg-primary/5 hover:border-primary/50 active:scale-[0.98]"
                  }`}
                >
                  {plan.slug === "custom" ? t("pricing.contact_us") : t("pricing.get_started")}
                </button>

                <div className="flex-1">
                  <div className="text-sm font-medium mb-4 text-foreground uppercase tracking-wider">
                    {t("pricing.features")}
                  </div>
                  <ul className="space-y-4">
                    {plan.limits && (
                      <li className="flex items-start gap-3 text-sm text-foreground-muted leading-tight">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span>
                          <strong className="text-foreground font-medium">{plan.limits.maxListings}</strong> Tin đăng
                        </span>
                      </li>
                    )}
                    {plan.limits?.maxLeadsPerMonth ? (
                      <li className="flex items-start gap-3 text-sm text-foreground-muted leading-tight">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span>
                          <strong className="text-foreground font-medium">{plan.limits.maxLeadsPerMonth}</strong> Lead/tháng
                        </span>
                      </li>
                    ) : plan.limits ? (
                      <li className="flex items-start gap-3 text-sm text-foreground-muted leading-tight">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span>Không giới hạn Lead</span>
                      </li>
                    ) : null}

                    {plan.features?.customFeatures?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-foreground-muted leading-tight">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
