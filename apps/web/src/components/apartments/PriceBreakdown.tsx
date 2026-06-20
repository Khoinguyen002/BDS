"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useCurrency } from "@/hooks/useCurrency";
import { CaretDownIcon, CaretUpIcon,  InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

import { Apartment } from "@bds/shared/payload-types";

type PriceBreakdownProps = {
  price?: number | null;
  apartment: Apartment;
};

export const PriceBreakdown = ({ price, apartment }: PriceBreakdownProps) => {
  const t = useTranslations("apartments");
  const { formatCurrency, formatUSD } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const priceBreakdown = apartment.priceBreakdown;
  const rentPricing = apartment.rentPricing;
  const isRent = apartment.listingType === "rent" || apartment.propertyType === "boarding_room";

  // Pricing thống nhất về apt.price (+ priceUnit). Không còn pricePerMonth/totalPrice.
  const displayPrice = price ?? apartment.price;

  if (!displayPrice) {
    return (
      <div className="text-2xl font-bold text-foreground">
        {t("price_contact")}
      </div>
    );
  }

  return (
    <div className="w-full bg-background-subtle rounded-none border border-border/50 p-4 md:p-6 transition-all duration-300">
      <div className="flex flex-col gap-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-medium text-foreground-muted block mt-1">
            {t("total_price")}
          </span>
          <div className="flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors shrink-0">
            <span className="text-sm font-medium">{t("price_breakdown")}</span>
            {isOpen ? <CaretUpIcon weight="bold" /> : <CaretDownIcon weight="bold" />}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2">
            <span className="text-3xl md:text-4xl font-bold text-primary break-all">
              {formatCurrency(displayPrice)}
            </span>
            {priceBreakdown?.negotiable && (
              <span className="text-sm text-success bg-success/10 px-2 py-0.5 rounded-none font-medium shrink-0">
                {t("negotiable")}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-foreground-muted">
            {formatUSD(displayPrice)}
          </span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {!isRent && priceBreakdown && (
            <>
              {priceBreakdown.pricePerSqm && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted">{t("price_per_sqm")}</span>
                  <span className="font-medium text-foreground">{formatCurrency(priceBreakdown.pricePerSqm)}/m²</span>
                </div>
              )}
              
              {priceBreakdown.transferFee && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted flex items-center gap-1">
                    {t("transfer_fee")}
                    <InfoIcon weight="duotone" className="w-4 h-4" />
                  </span>
                  <span className="font-medium text-foreground">{priceBreakdown.transferFee}</span>
                </div>
              )}

              {priceBreakdown.taxResponsibility && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted">{t("tax_responsibility")}</span>
                  <span className="font-medium text-foreground">{t(`tax_${priceBreakdown.taxResponsibility}`)}</span>
                </div>
              )}
            </>
          )}

          {isRent && rentPricing && (
            <>
              {rentPricing.deposit && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted">{t("deposit")}</span>
                  <span className="font-medium text-foreground">{t(`deposit_${rentPricing.deposit}`)}</span>
                </div>
              )}
              {rentPricing.minLeaseTerm && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted">{t("min_lease_term")}</span>
                  <span className="font-medium text-foreground">{rentPricing.minLeaseTerm} {t("months")}</span>
                </div>
              )}
              {rentPricing.availableDate && (
                <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
                  <span className="text-sm text-foreground-muted">{t("available_date")}</span>
                  <span className="font-medium text-foreground">{new Date(rentPricing.availableDate).toLocaleDateString()}</span>
                </div>
              )}
            </>
          )}

          {(priceBreakdown?.managementFee || rentPricing?.managementFeeIncluded !== undefined) && (
            <div className="flex flex-col gap-1.5 pb-3 border-b border-border/30">
              <span className="text-sm text-foreground-muted">{t("management_fee")}</span>
              <span className="font-medium text-foreground">
                {priceBreakdown?.managementFee ? `${formatCurrency(priceBreakdown.managementFee)} / ${t('month') || 'tháng'}` : 
                 (rentPricing?.managementFeeIncluded ? t("included") : t("not_included"))}
              </span>
            </div>
          )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
