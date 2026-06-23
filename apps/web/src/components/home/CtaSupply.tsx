"use client";

import React from "react";
import { HouseLineIcon, PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

type CtaSupplyProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonLink?: string;
};

export const CtaSupply = ({ title, description, buttonLabel, buttonLink }: CtaSupplyProps) => {
  const t = useTranslations("home");
  return (
    <section className="py-24 bg-foreground text-background">
      <div className="container max-w-4xl text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-secondary/20 rounded-none flex items-center justify-center mb-8">
          <HouseLineIcon weight="duotone" className="w-8 h-8 text-secondary" />
        </div>
        
        <h2 className="font-bold mb-6">{title || t("cta_supply_title")}</h2>
        <p className="text-lg text-background/80 mb-10 max-w-2xl">
          {description || t("cta_supply_desc")}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button className="w-full sm:w-auto px-8 py-4 rounded-none bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            {buttonLabel || t("cta_post_free")}
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-none bg-background text-foreground font-bold hover:bg-background/90 transition-colors flex items-center justify-center gap-2">
            {t("cta_consign")} <PaperPlaneRightIcon weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
};
