"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useTranslations } from "next-intl";

type Currency = "VND" | "USD" | "THB";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount?: number | null) => string;
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

  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) {
      return t("price_contact") || "Liên hệ";
    }

    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(amount);
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

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
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
