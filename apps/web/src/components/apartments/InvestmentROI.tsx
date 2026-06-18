import React from "react";
import { TrendUpIcon, ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr";

type InvestmentROIProps = {
  rentalYield?: number | null;
  t: (key: string) => string;
};

export const InvestmentROI = ({ rentalYield, t }: InvestmentROIProps) => {
  if (!rentalYield) return null;

  return (
    <div className="bg-success/5 border border-success/20 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-2">
        <ChartLineUpIcon weight="duotone" className="w-8 h-8 text-success" />
        <h3 className="text-xl font-bold text-foreground">{t("investment_roi")}</h3>
      </div>

      <div className="flex items-end justify-between bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-border/50">
        <div>
          <span className="text-sm text-foreground-muted block mb-1">
            {t("rental_yield")}
          </span>
          <span className="text-4xl font-bold text-success flex items-center gap-2">
            {rentalYield}%
            <TrendUpIcon weight="bold" className="w-6 h-6" />
          </span>
        </div>
      </div>

      <p className="text-xs text-foreground-muted italic mt-2 text-center">
        * {t("roi_disclaimer")}
      </p>
    </div>
  );
};
