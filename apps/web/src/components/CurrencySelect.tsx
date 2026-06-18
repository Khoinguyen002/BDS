"use client";

import { useCurrency } from "@/hooks/useCurrency";

export function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as "VND" | "USD" | "THB")}
        className="appearance-none pl-3 pr-7 py-3.5 w-[76px] h-14 bg-background border border-border hover:border-border-strong shadow-sm hover:shadow-md transition-all duration-200 uppercase font-mono font-bold text-xs tracking-widest text-foreground-secondary hover:text-foreground active:scale-95 text-left cursor-pointer"
        aria-label="Select currency"
      >
        <option value="VND">VND</option>
        <option value="USD">USD</option>
        <option value="THB">THB</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-foreground-secondary">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}
