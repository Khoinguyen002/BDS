"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  MagnifyingGlassIcon,
  CurrencyCircleDollarIcon,
  BuildingsIcon,
  CaretDownIcon,
  MapPinIcon,
  XCircleIcon,
  ArrowsCounterClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Location } from "@bds/shared/payload-types";
import { LocationPanel, type SelectedLocation } from "./LocationCombobox";
import { parseSearchQuery, type PropertyMode } from "@/lib/search-parser";

// ─────────────────────────────────────────────────────────────
// Price ranges by mode
// ─────────────────────────────────────────────────────────────
const PRICE_RANGES: Record<string, { label: string; value: string }[]> = {
  "apartment-sale": [
    { label: "Dưới 2 tỷ", value: "0-2000000000" },
    { label: "2 – 5 tỷ", value: "2000000000-5000000000" },
    { label: "5 – 10 tỷ", value: "5000000000-10000000000" },
    { label: "10 – 20 tỷ", value: "10000000000-20000000000" },
    { label: "Trên 20 tỷ", value: "20000000000-" },
  ],
  "land_house-sale": [
    { label: "Dưới 2 tỷ", value: "0-2000000000" },
    { label: "2 – 5 tỷ", value: "2000000000-5000000000" },
    { label: "5 – 10 tỷ", value: "5000000000-10000000000" },
    { label: "10 – 20 tỷ", value: "10000000000-20000000000" },
    { label: "Trên 20 tỷ", value: "20000000000-" },
  ],
  "apartment-rent": [
    { label: "Dưới 10 triệu/tháng", value: "0-10000000" },
    { label: "10 – 20 triệu/tháng", value: "10000000-20000000" },
    { label: "20 – 40 triệu/tháng", value: "20000000-40000000" },
    { label: "Trên 40 triệu/tháng", value: "40000000-" },
  ],
  "boarding_room-rent": [
    { label: "Dưới 2 triệu/tháng", value: "0-2000000" },
    { label: "2 – 5 triệu/tháng", value: "2000000-5000000" },
    { label: "5 – 10 triệu/tháng", value: "5000000-10000000" },
    { label: "Trên 10 triệu/tháng", value: "10000000-" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Dynamic placeholders (P2)
// ─────────────────────────────────────────────────────────────
const PLACEHOLDERS: Partial<Record<PropertyMode, string>> = {
  "apartment-sale": "Căn hộ 3PN Quận 2 dưới 5 tỷ",
  "apartment-rent": "Căn hộ 2PN Bình Thạnh dưới 20 triệu",
  "land_house-sale": "Nhà phố Quận 7 dưới 10 tỷ",
  "boarding_room-rent": "Phòng trọ Quận 7 dưới 5 triệu",
};
const fallbackPlaceholder = "Nhập khu vực, loại nhà...";

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
type SearchFunnelProps = {
  agentSlug?: string;
  locations?: Location[];
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const SearchFunnel = ({ agentSlug, locations = [] }: SearchFunnelProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("rent");
  const [propertyType, setPropertyType] = useState<string>("apartment");
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [price, setPrice] = useState("");
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);

  // Dirty flags — parser won't overwrite fields user has explicitly set
  const dirtyFields = useRef<Set<"propertyMode" | "price" | "locations">>(new Set());

  // Derived
  const propertyMode: PropertyMode | "" = propertyType ? `${propertyType}-${listingType}` as PropertyMode : "";
  const currentPriceRanges = propertyMode ? (PRICE_RANGES[propertyMode] ?? []) : (PRICE_RANGES[`apartment-${listingType}`] ?? []);
  const currentPlaceholder = propertyMode ? (PLACEHOLDERS[propertyMode] ?? fallbackPlaceholder) : (PLACEHOLDERS[`apartment-${listingType}` as PropertyMode] ?? fallbackPlaceholder);

  // ── NLP Parser (P3) ───────────────────────────────────────
  const parserTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (parserTimer.current) clearTimeout(parserTimer.current);
      parserTimer.current = setTimeout(() => {
        const parsed = parseSearchQuery(text);

        // Only fill fields user hasn't explicitly touched
        if (parsed.propertyMode && !dirtyFields.current.has("propertyMode")) {
          const [pt, lt] = parsed.propertyMode.split("-");
          if (lt) setListingType(lt as "sale" | "rent");
          if (pt) setPropertyType(pt);
          setPrice(""); // reset price when mode changes via parser
        }

        if (!dirtyFields.current.has("price")) {
          // Auto-select price range that matches parsed min/max
          if (parsed.priceMin !== undefined || parsed.priceMax !== undefined) {
            const ranges = parsed.propertyMode
              ? (PRICE_RANGES[parsed.propertyMode] ?? [])
              : (PRICE_RANGES[`apartment-${parsed.propertyMode?.split('-')[1] || listingType}`] ?? []);
            for (const range of ranges) {
              const [rMin, rMax] = range.value.split("-").map(Number);
              const matchMin = parsed.priceMin === undefined || parsed.priceMin >= rMin;
              const matchMax =
                parsed.priceMax === undefined ||
                (!rMax ? true : parsed.priceMax <= rMax);
              if (matchMin && matchMax) {
                setPrice(range.value);
                break;
              }
            }
          }
        }

        if (parsed.locationQuery && !dirtyFields.current.has("locations")) {
          const locLower = parsed.locationQuery.toLowerCase();
          const matched = locations.find(l => (l.title as string).toLowerCase().includes(locLower));
          if (matched) {
            setSelectedLocations([{
              id: matched.id,
              slug: matched.slug as string,
              title: matched.title as string,
              level: matched.level as "city" | "district" | "ward"
            }]);
          }
        }
      }, 400);
    },
    [locations],
  );

  // ── Submit ────────────────────────────────────────────────
  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Parse one last time synchronously to ensure we have the exact output for the final text
    const parsed = parseSearchQuery(searchQuery);

    if (parsed.cleanedQuery) params.set("q", parsed.cleanedQuery);
    if (parsed.bedrooms) params.set("bedrooms", String(parsed.bedrooms));
    if (propertyType) params.set("propertyType", propertyType);
    if (listingType) params.set("type", listingType);

    // Location: slugs joined
    if (selectedLocations.length > 0) {
      params.set("location", selectedLocations.map((l) => l.slug).join(","));
    }

    // Price: only send when listingType is set
    if (price && listingType) {
      const [min, max] = price.split("-");
      if (min && min !== "0") params.set("priceMin", min);
      if (max) params.set("priceMax", max);
    }

    const basePath = agentSlug
      ? `/${locale}/${agentSlug}/apartments`
      : `/${locale}/search`;
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full bg-background p-4 md:p-6 shadow-xl border border-border/50"
    >
      <form onSubmit={handleSearch} className="flex flex-col gap-3">

        {/* Tabs: Sale vs Rent */}
        <div className="flex items-center gap-6 mb-1 px-2">
          <button
             type="button"
             onClick={() => {
               dirtyFields.current.add("propertyMode");
               setListingType("rent");
               if (propertyType === "land_house") setPropertyType("apartment");
               setPrice("");
             }}
             className={`pb-2 border-b-2 font-medium text-base transition-colors ${listingType === 'rent' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
          >
             {t("apartments.for_rent")}
          </button>
          <button
             type="button"
             onClick={() => {
               dirtyFields.current.add("propertyMode");
               setListingType("sale");
               if (propertyType === "boarding_room") setPropertyType("apartment");
               setPrice("");
             }}
             className={`pb-2 border-b-2 font-medium text-base transition-colors ${listingType === 'sale' ? 'border-primary text-primary' : 'border-transparent text-foreground-muted hover:text-foreground'}`}
          >
             {t("apartments.for_sale")}
          </button>
        </div>

        {/* Row 1: Loại hình + Text Search + Submit */}
        <div className="flex flex-col md:flex-row items-stretch w-full bg-background border border-border shadow-sm divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Bất động sản */}
          <div className="relative md:w-56 w-full py-1 shrink-0">
            <BuildingsIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none z-10" />
            <CaretDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none z-10" />
            <select
              value={propertyType}
              onChange={(e) => {
                dirtyFields.current.add("propertyMode");
                setPropertyType(e.target.value);
                setPrice("");
              }}
              className="w-full h-14 pl-12 pr-10 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-sm appearance-none cursor-pointer"
            >
              <option value="apartment">{t("apartments.type_apartment")}</option>
              {listingType === "sale" && <option value="land_house">{t("apartments.type_land_house")}</option>}
              {listingType === "rent" && <option value="boarding_room">{t("apartments.type_boarding_room")}</option>}
            </select>
          </div>

          {/* Text Search — with NLP parser */}
          <div className="relative flex-1 w-full py-1">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full h-14 pl-12 pr-5 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-base placeholder:text-foreground-muted"
            />
          </div>

          {/* Desktop Submit */}
          <div className="hidden md:flex w-auto p-1.5 items-center gap-2">
            <AnimatePresence>
              {(searchQuery || selectedLocations.length > 0 || price || propertyType !== "apartment" || listingType !== "rent") && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden flex items-center h-full shrink-0"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setListingType("rent");
                      setPropertyType("apartment");
                      setSelectedLocations([]);
                      setPrice("");
                      dirtyFields.current.clear();
                      router.push(agentSlug ? `/${locale}/${agentSlug}/apartments` : `/${locale}/search`);
                    }}
                    className="h-full min-h-[48px] px-4 text-foreground-muted hover:text-foreground border-border"
                    title={t("apartments.reset_filters")}
                  >
                    <ArrowsCounterClockwiseIcon className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              type="submit"
              className="h-full min-h-[48px] px-8 text-base font-medium flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {t("home.search_btn")}
            </Button>
          </div>
        </div>

        {/* Row 2: Location trigger + Price */}
        <div className="flex flex-col md:flex-row items-stretch w-full bg-background border border-border shadow-sm divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Location — trigger button */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setLocationPanelOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && setLocationPanelOpen(true)}
            className="flex items-center gap-3 flex-1 h-[64px] pl-5 pr-4 text-left hover:bg-primary/5 transition-colors min-w-0 cursor-pointer"
          >
            <MapPinIcon className="w-5 h-5 text-foreground-muted shrink-0" />
            {selectedLocations.length === 0 ? (
              <span className="text-foreground-muted text-sm">{t("apartments.location_trigger")}</span>
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                {selectedLocations.slice(0, 2).map((loc) => (
                  <span
                    key={loc.id}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 shrink-0"
                  >
                    {loc.title}
                  </span>
                ))}
                {selectedLocations.length > 2 && (
                  <span className="text-xs text-foreground-muted shrink-0">
                    {t("apartments.more_locations", { count: selectedLocations.length - 2 })}
                  </span>
                )}
              </div>
            )}
            {selectedLocations.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dirtyFields.current.add("locations");
                  setSelectedLocations([]);
                }}
                className="ml-auto shrink-0 text-foreground-muted hover:text-foreground transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Price — dynamic based on mode */}
          <div className="relative md:w-56 w-full py-1 shrink-0">
            <CurrencyCircleDollarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none" />
            <CaretDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
            <select
              value={price}
              onChange={(e) => {
                dirtyFields.current.add("price");
                setPrice(e.target.value);
              }}
              className="w-full h-14 pl-12 pr-10 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-sm appearance-none cursor-pointer"
            >
              <option value="">{t("home.filter_price")}</option>
              {currentPriceRanges.length > 0
                ? currentPriceRanges.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))
                : (
                  <>
                    <option value="0-2000000000">Dưới 2 tỷ</option>
                    <option value="2000000000-5000000000">2 – 5 tỷ</option>
                    <option value="5000000000-10000000000">5 – 10 tỷ</option>
                    <option value="10000000000-">Trên 10 tỷ</option>
                  </>
                )}
            </select>
          </div>
        </div>

        {/* Mobile Submit */}
        <div className="flex md:hidden w-full flex-col gap-2 mt-2">
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            {t("home.search_btn")}
          </Button>
          <AnimatePresence>
            {(searchQuery || selectedLocations.length > 0 || price || propertyType !== "apartment" || listingType !== "rent") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden w-full"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setListingType("rent");
                    setPropertyType("apartment");
                    setSelectedLocations([]);
                    setPrice("");
                    dirtyFields.current.clear();
                    router.push(agentSlug ? `/${locale}/${agentSlug}/apartments` : `/${locale}/search`);
                  }}
                  className="w-full h-12 text-foreground-muted hover:text-foreground border-border"
                >
                  <ArrowsCounterClockwiseIcon className="w-5 h-5 mr-2" />
                  {t("apartments.reset_filters")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      <AnimatePresence>
        {locationPanelOpen && (
          <LocationPanel
            allLocations={locations}
            value={selectedLocations}
            onChange={setSelectedLocations}
            onClose={() => setLocationPanelOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
