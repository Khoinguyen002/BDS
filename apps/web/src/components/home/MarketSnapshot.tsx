"use client";

import React from "react";
import { TrendUpIcon, ChartLineUpIcon, BuildingApartmentIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

export const MarketSnapshot = () => {
  const t = useTranslations("home");
  return (
    <section className="py-24 px-4 md:px-8 border-y border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">{t("market_snapshot_title")}</h2>
          <p className="text-foreground-muted text-lg">
            {t("market_snapshot_description")}
          </p>
          
          <div className="flex items-center gap-6 pt-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <span className="block text-sm text-primary font-medium mb-1">{t("market_avg_price")}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">75.5</span>
                <span className="text-foreground-muted font-medium">Tr/m²</span>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm mt-2 font-medium">
                <TrendUpIcon weight="bold" />
                <span>+2.4% tháng này</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-subtle flex items-center justify-center shrink-0">
                  <ChartLineUpIcon weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <span className="block text-sm font-medium">{t("market_high_liquidity")}</span>
                  <span className="text-xs text-foreground-muted">{t("market_avg_days")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-subtle flex items-center justify-center shrink-0">
                  <BuildingApartmentIcon weight="duotone" className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <span className="block text-sm font-medium">{t("market_low_supply")}</span>
                  <span className="text-xs text-foreground-muted">{t("market_new_listings")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full aspect-video md:aspect-[4/3] rounded-3xl bg-background-subtle border border-border flex items-center justify-center overflow-hidden relative">
          {/* Abstract Chart Representation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
          <svg className="w-full h-full text-primary/20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 L0,80 Q25,90 50,60 T100,20 L100,100 Z" fill="currentColor" />
            <path d="M0,80 Q25,90 50,60 T100,20" fill="none" stroke="var(--theme-primary)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
};
