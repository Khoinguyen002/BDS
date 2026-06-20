/**
 * exchange-rate.ts
 *
 * Fetch tỉ giá, dùng luôn Next Data Cache (KV + regional Cache API L1) qua
 * `next: { revalidate, tags }` — đồng nhất với mọi fetch khác, không tự quản
 * CF Cache API thủ công nữa.
 */

import { EXCHANGE_RATE_TAG } from "@bds/shared/cache-tags";

const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/USD";
const CACHE_TTL = 300; // 5 phút

export interface ExchangeRates {
  VND: number;
  THB: number;
  USD: number;
  [key: string]: number;
}

const DEFAULT_RATES: ExchangeRates = {
  VND: 25400,
  THB: 36.5,
  USD: 1,
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch(EXCHANGE_RATE_URL, {
      next: { revalidate: CACHE_TTL, tags: [EXCHANGE_RATE_TAG] },
    });
    if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };
    return extractRates(data?.rates);
  } catch (error) {
    console.error("Failed to fetch exchange rates, using defaults:", error);
    return DEFAULT_RATES;
  }
}

function extractRates(rates?: Record<string, number>): ExchangeRates {
  if (!rates) return DEFAULT_RATES;
  return {
    VND: rates.VND ?? DEFAULT_RATES.VND,
    THB: rates.THB ?? DEFAULT_RATES.THB,
    USD: 1,
  };
}
