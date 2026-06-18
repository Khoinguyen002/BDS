import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import { ArmchairIcon } from "@phosphor-icons/react/dist/ssr";

export const FurnitureStatus = ({ apartment }: { apartment: Apartment }) => {
  const t = useTranslations("apartments");
  const kf = apartment.keyFacts;
  
  if (!kf?.furnitureStatus) return null;
  // This is primarily for apartments for rent, but can be shown anywhere if it has furniture.

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("furniture_status") || "Tình trạng nội thất"}</h2>
      <div className="flex items-center gap-4 bg-background-subtle border border-border p-6 rounded-none shadow-sm">
        <div className="p-4 bg-primary/10 rounded-full">
          <ArmchairIcon className="w-8 h-8 text-primary" weight="duotone" />
        </div>
        <div>
          <p className="text-sm text-foreground-muted uppercase tracking-wider font-semibold mb-1">
            {t("furniture_level") || "Mức độ"}
          </p>
          <p className="text-xl font-bold text-foreground">
            {t(`furniture_${kf.furnitureStatus}`) || kf.furnitureStatus}
          </p>
        </div>
      </div>
    </section>
  );
};
