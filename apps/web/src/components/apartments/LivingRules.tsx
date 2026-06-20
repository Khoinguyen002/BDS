import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";

export const LivingRules = ({ apartment }: { apartment: Apartment }) => {
  const t = useTranslations("apartments");
  const kf = apartment.keyFacts;
  if (!kf || apartment.propertyType !== "boarding_room") return null;

  const rules = [
    { label: t("shared_landlord") || "Chung chủ", val: kf.sharedLandlord },
    { label: t("free_hours") || "Giờ giấc tự do", val: kf.freeHours },
    { label: t("cooking_allowed") || "Cho phép nấu ăn", val: kf.cookingAllowed },
    { label: t("pet_friendly") || "Cho phép thú cưng", val: kf.petFriendly },
  ].filter(r => r.val !== null && r.val !== undefined);

  if (rules.length === 0 && !kf.hasNightCurfew) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("living_rules") || "Nội quy phòng trọ"}</h2>
      <div className="flex flex-wrap gap-4">
        {rules.map((r, i) => (
          <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-none border ${r.val ? 'border-secondary/50 bg-secondary/5 text-secondary' : 'border-red-500/50 bg-red-500/5 text-red-600'}`}>
            {r.val ? <CheckCircleIcon className="w-5 h-5" weight="fill" /> : <XCircleIcon className="w-5 h-5" weight="fill" />}
            <span className="font-medium text-sm">{r.label}</span>
          </div>
        ))}
        {kf.hasNightCurfew && kf.curfewTime && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-none border border-amber-500/50 bg-amber-500/5 text-amber-600">
            <XCircleIcon className="w-5 h-5" weight="fill" />
            <span className="font-medium text-sm">{t("curfew_time") || "Giới nghiêm"}: {kf.curfewTime}</span>
          </div>
        )}
      </div>
    </section>
  );
};
