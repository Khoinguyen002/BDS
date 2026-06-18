"use client";

import React, { useState } from "react";

import { InfoIcon, CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react/dist/ssr";

import { Apartment } from "@bds/shared/payload-types";

type PriceBreakdownProps = {
  price?: number | null;
  priceBreakdown?: Apartment["priceBreakdown"];
  t: (key: string) => string;
};

export const PriceBreakdown = ({ price, priceBreakdown, t }: PriceBreakdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayPrice = priceBreakdown?.totalPrice || price;

  if (!displayPrice) {
    return (
      <div className="text-2xl font-bold text-foreground">
        {t("price_contact")}
      </div>
    );
  }

  return (
    <div className="w-full bg-background-subtle rounded-2xl border border-border/50 p-4 md:p-6 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <span className="text-sm font-medium text-foreground-muted mb-1 block">
            {t("total_price")}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-primary">
              {formatCurrency(displayPrice)}
            </span>
            {priceBreakdown?.negotiable && (
              <span className="text-sm text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
                {t("negotiable")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors">
          <span className="text-sm font-medium">{t("price_breakdown")}</span>
          {isOpen ? <CaretUpIcon weight="bold" /> : <CaretDownIcon weight="bold" />}
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {priceBreakdown?.pricePerSqm && (
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-foreground-muted">{t("price_per_sqm")}</span>
              <span className="font-medium">{formatCurrency(priceBreakdown.pricePerSqm)}/m²</span>
            </div>
          )}
          
          {priceBreakdown?.transferFee && (
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-foreground-muted flex items-center gap-1">
                {t("transfer_fee")}
                <InfoIcon weight="duotone" className="w-4 h-4" />
              </span>
              <span className="font-medium">{priceBreakdown.transferFee}</span>
            </div>
          )}

          {priceBreakdown?.taxResponsibility && (
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-foreground-muted">{t("tax_responsibility")}</span>
              <span className="font-medium">{t(`tax_${priceBreakdown.taxResponsibility}`)}</span>
            </div>
          )}

          {priceBreakdown?.managementFee && (
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-foreground-muted">{t("management_fee")}</span>
              <span className="font-medium">{formatCurrency(priceBreakdown.managementFee)} / {t('month') || 'tháng'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
