/**
 * search-parser.ts
 *
 * Client-side NLP parser for the search text input.
 * Parses natural language Vietnamese/English BDS queries into structured state.
 *
 * Rules: regex only, offline, zero latency.
 * Precision over recall — only fill what we're confident about.
 */

export type PropertyMode =
  | ""
  | "apartment-sale"
  | "apartment-rent"
  | "land_house-sale"
  | "boarding_room-rent";

export interface ParsedSearch {
  propertyMode?: PropertyMode;
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  locationQuery?: string; // raw string to pass into location combobox search
  cleanedQuery?: string;  // raw string with parsed intents removed
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const TY = 1_000_000_000; // 1 tỷ
const TRIEU = 1_000_000;   // 1 triệu

function extractNumber(s: string): number {
  return parseFloat(s.replace(",", "."));
}

// ─────────────────────────────────────────────────────────────
// Parser
// ─────────────────────────────────────────────────────────────
export function parseSearchQuery(text: string): ParsedSearch {
  if (!text.trim()) return {};

  const result: ParsedSearch = {};
  const t = text.toLowerCase();

  // ── Bedrooms ───────────────────────────────────────────────
  let cleaned = text;

  const bedroomMatch = t.match(
    /(\d)\s*(?:pn|br|phòng ngủ|bedroom|phòng|room)\b/i,
  );
  if (bedroomMatch) {
    result.bedrooms = parseInt(bedroomMatch[1]);
    cleaned = cleaned.replace(new RegExp(bedroomMatch[0], 'i'), "");
  }

  // ── Property mode hints ───────────────────────────────────
  // Only set if no mode has been explicitly selected (caller decides)
  const isRentHint =
    /cho thuê|thuê|rent|rental/i.test(t);
  const isBoardingHint =
    /phòng trọ|nhà trọ|phòng cho thuê|boarding/i.test(t);
  const isApartmentHint =
    /căn hộ|chung cư|apartment|condo/i.test(t);
  const isLandHouseHint =
    /nhà phố|nhà riêng|nhà đất|villa|biệt thự|land|house/i.test(t);

  if (isBoardingHint) {
    result.propertyMode = "boarding_room-rent";
    cleaned = cleaned.replace(/phòng trọ|nhà trọ|phòng cho thuê|boarding/gi, "");
  } else if (isApartmentHint && isRentHint) {
    result.propertyMode = "apartment-rent";
    cleaned = cleaned.replace(/căn hộ|chung cư|apartment|condo/gi, "");
  } else if (isApartmentHint) {
    result.propertyMode = "apartment-sale";
    cleaned = cleaned.replace(/căn hộ|chung cư|apartment|condo/gi, "");
  } else if (isLandHouseHint) {
    result.propertyMode = "land_house-sale";
    cleaned = cleaned.replace(/nhà phố|nhà riêng|nhà đất|villa|biệt thự|land|house/gi, "");
  } else if (isRentHint) {
    result.propertyMode = "apartment-rent"; // default rent → apartment
  }

  if (isRentHint) {
    cleaned = cleaned.replace(/cho thuê|thuê|rent|rental/gi, "");
  }

  // ── Price — TỶ (sale, total) ───────────────────────────────
  const underTyMatch = t.match(
    /(?:dưới|under|<|tối đa|max)\s*(\d+(?:[.,]\d+)?)\s*tỷ/i,
  );
  const fromTyMatch = t.match(
    /(?:từ|trên|over|từ khoảng|min|>)\s*(\d+(?:[.,]\d+)?)\s*tỷ/i,
  );
  const rangeTyMatch = t.match(
    /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*tỷ/i,
  );

  // ── Price — TRIỆU (rent, per_month) ───────────────────────
  const underTrieuMatch = t.match(
    /(?:dưới|under|<|tối đa|max)\s*(\d+(?:[.,]\d+)?)\s*triệu/i,
  );
  const fromTrieuMatch = t.match(
    /(?:từ|trên|over|từ khoảng|min|>)\s*(\d+(?:[.,]\d+)?)\s*triệu/i,
  );
  const rangeTrieuMatch = t.match(
    /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*triệu/i,
  );

  if (rangeTyMatch) {
    result.priceMin = extractNumber(rangeTyMatch[1]) * TY;
    result.priceMax = extractNumber(rangeTyMatch[2]) * TY;
    if (!result.propertyMode) result.propertyMode = "apartment-sale";
    cleaned = cleaned.replace(new RegExp(rangeTyMatch[0], 'i'), "");
  } else if (underTyMatch) {
    result.priceMax = extractNumber(underTyMatch[1]) * TY;
    if (!result.propertyMode) result.propertyMode = "apartment-sale";
    cleaned = cleaned.replace(new RegExp(underTyMatch[0], 'i'), "");
  } else if (fromTyMatch) {
    result.priceMin = extractNumber(fromTyMatch[1]) * TY;
    if (!result.propertyMode) result.propertyMode = "apartment-sale";
    cleaned = cleaned.replace(new RegExp(fromTyMatch[0], 'i'), "");
  }

  if (rangeTrieuMatch) {
    result.priceMin = extractNumber(rangeTrieuMatch[1]) * TRIEU;
    result.priceMax = extractNumber(rangeTrieuMatch[2]) * TRIEU;
    if (!result.propertyMode)
      result.propertyMode = "apartment-rent";
    cleaned = cleaned.replace(new RegExp(rangeTrieuMatch[0], 'i'), "");
  } else if (underTrieuMatch) {
    result.priceMax = extractNumber(underTrieuMatch[1]) * TRIEU;
    if (!result.propertyMode) result.propertyMode = "apartment-rent";
    cleaned = cleaned.replace(new RegExp(underTrieuMatch[0], 'i'), "");
  } else if (fromTrieuMatch) {
    result.priceMin = extractNumber(fromTrieuMatch[1]) * TRIEU;
    if (!result.propertyMode) result.propertyMode = "apartment-rent";
    cleaned = cleaned.replace(new RegExp(fromTrieuMatch[0], 'i'), "");
  }

  // ── Location query (raw, pass to combobox) ─────────────────
  // Extract quận/quận N mentions to pre-fill combobox
  const districtMatch = t.match(
    /(?:quận|q|district)\s*(\d+)/i,
  );
  const namedDistrictMatch = t.match(
    /(?:bình thạnh|gò vấp|phú nhuận|tân bình|tân phú|bình tân|thủ đức)/i,
  );

  if (districtMatch) {
    result.locationQuery = `Quận ${districtMatch[1]}`;
    cleaned = cleaned.replace(new RegExp(districtMatch[0], 'i'), "");
  } else if (namedDistrictMatch) {
    result.locationQuery = namedDistrictMatch[0];
    cleaned = cleaned.replace(new RegExp(namedDistrictMatch[0], 'i'), "");
  }

  // Cleanup spaces and punctuation
  cleaned = cleaned.replace(/[,;-]/g, " ").replace(/\s+/g, " ").trim();
  result.cleanedQuery = cleaned;

  return result;
}
