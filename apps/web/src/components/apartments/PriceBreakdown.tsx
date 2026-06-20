"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";

import { Apartment } from "@bds/shared/payload-types";

type PriceBreakdownProps = {
  price?: number | null;
  apartment: Apartment;
};

export const PriceBreakdown = ({ price, apartment }: PriceBreakdownProps) => {
  const t = useTranslations("apartments");
  const { formatCurrency, formatUSD } = useCurrency();

  // Pricing thống nhất về apt.price (+ priceUnit). Chi tiết giá (phí, cọc...) giờ
  // do agent tự mô tả trong các section động.
  const displayPrice = price ?? apartment.price;

  if (!displayPrice) {
    return <div className="text-lg md:text-xl font-bold text-foreground">{t("price_contact")}</div>;
  }

  return (
    <div className="w-full bg-background-subtle border border-border/50 p-4 md:p-6">
      <span className="text-sm font-medium text-foreground-muted block mb-1">
        {t("total_price")}
      </span>
      <div className="flex flex-row items-end gap-3 flex-wrap mt-1">
        <span className="text-lg md:text-xl font-bold text-primary break-all tabular-nums font-mono tracking-tighter">
          {formatCurrency(displayPrice)}
        </span>
        <span className="text-xs md:text-sm font-medium text-foreground-muted mb-1 tabular-nums font-mono tracking-tighter">
          {formatUSD(displayPrice)}
        </span>
      </div>
    </div>
  );
};
