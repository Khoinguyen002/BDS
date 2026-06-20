"use client";

import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";

import { Apartment } from "@bds/shared/payload-types";
import { SaveAndShare } from "@/components/apartments/SaveAndShare";

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
    return (
      <div className="w-full bg-background-subtle border border-border/50 p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg md:text-xl font-bold text-foreground">
            {t("price_contact")}
          </div>
          <SaveAndShare apartmentId={apartment.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background-subtle border border-border/50 p-4 md:p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground-muted block">
            {t("total_price")}
          </span>
          <div className="flex flex-row items-baseline gap-3 flex-wrap">
            <span className="text-xl md:text-2xl font-bold text-primary break-all tabular-nums font-mono tracking-tighter">
              {formatCurrency(displayPrice)}
            </span>
            <span className="text-sm font-medium text-foreground-muted tabular-nums font-mono tracking-tighter">
              {formatUSD(displayPrice)}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <SaveAndShare apartmentId={apartment.id} />
        </div>
      </div>
    </div>
  );
};
