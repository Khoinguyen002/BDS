"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";

type Currency = "VND" | "USD" | "THB";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount?: number | null) => string;
  formatUSD: (amount?: number | null) => string;
  formatVND: (amount?: number | null) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ 
  children, 
  initialCurrency = "VND",
  initialRates
}: { 
  children: ReactNode; 
  initialCurrency?: string;
  initialRates?: Record<string, number>;
}): React.ReactElement {
  const t = useTranslations("apartments");
  const [currency, setCurrencyState] = useState<Currency>((initialCurrency as Currency) || "VND");
  const rates = initialRates || { VND: 25400, THB: 36.5, USD: 1 };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    // Save to cookie so server can read it next time
    document.cookie = `bds_currency=${newCurrency}; path=/; max-age=31536000`;
  };

  const localeStr = useLocale();

  const formatCompactVND = (amount: number): string => {
    const isEn = localeStr === "en";
    const numFormatLocale = isEn ? "en-US" : "vi-VN";
    if (amount >= 1e9) {
      const value = amount / 1e9;
      const formattedNum = new Intl.NumberFormat(numFormatLocale, { maximumFractionDigits: 2 }).format(value);
      return isEn ? `${formattedNum}B VND` : `${formattedNum} tỷ`;
    }
    if (amount >= 1e6) {
      const value = amount / 1e6;
      const formattedNum = new Intl.NumberFormat(numFormatLocale, { maximumFractionDigits: 2 }).format(value);
      return isEn ? `${formattedNum}M VND` : `${formattedNum} triệu`;
    }
    return new Intl.NumberFormat(numFormatLocale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) {
      return t("price_contact") || "Liên hệ";
    }

    if (currency === "VND") {
      return formatCompactVND(amount);
    }

    const usdAmount = amount / rates.VND;
    const targetAmount = usdAmount * rates[currency];

    let locale = "en-US";
    if (currency === "THB") locale = "th-TH";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: targetAmount >= 1000 ? 0 : 2,
    }).format(targetAmount);
  };

  const formatVND = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return t("price_contact") || "Liên hệ";
    return formatCompactVND(amount);
  };

  const formatUSD = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return "";
    const usdAmount = amount / rates.VND;
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: usdAmount >= 1000 ? 0 : 2,
    }).format(usdAmount);
    return `${formatted} USD`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, formatUSD, formatVND }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
