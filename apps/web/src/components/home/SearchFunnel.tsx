"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  CurrencyCircleDollarIcon,
  BuildingsIcon,
  CaretDownIcon,
  MapPinIcon,
  XCircleIcon,
  ArrowsCounterClockwiseIcon,
  KeyIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { Location } from "@bds/shared/payload-types";
import { LocationPanel, type SelectedLocation } from "./LocationCombobox";
import { parseSearchQuery } from "@/lib/search-parser";

// ─────────────────────────────────────────────────────────────
// Price ranges theo listingType (labels resolved via i18n).
// Đơn giản hoá: không còn phụ thuộc propertyType.
// ─────────────────────────────────────────────────────────────
const PRICE_RANGES: Record<"sale" | "rent", { labelKey: string; value: string }[]> = {
  sale: [
    { labelKey: "home.price_under_2b", value: "0-2000000000" },
    { labelKey: "home.price_2b_5b", value: "2000000000-5000000000" },
    { labelKey: "home.price_5b_10b", value: "5000000000-10000000000" },
    { labelKey: "home.price_10b_20b", value: "10000000000-20000000000" },
    { labelKey: "home.price_over_20b", value: "20000000000-" },
  ],
  rent: [
    { labelKey: "home.price_under_10m_month", value: "0-10000000" },
    { labelKey: "home.price_10m_20m_month", value: "10000000-20000000" },
    { labelKey: "home.price_20m_40m_month", value: "20000000-40000000" },
    { labelKey: "home.price_over_40m_month", value: "40000000-" },
  ],
};

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
type TagOption = { slug: string; title: string };

type SearchFunnelProps = {
  agentSlug?: string;
  locations?: Location[];
  tags?: TagOption[];
  /** Trên mobile, ẩn full funnel và chỉ hiện mini dropdown trigger. */
  compactMobile?: boolean;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export const SearchFunnel = ({ agentSlug, locations = [], tags = [], compactMobile = false }: SearchFunnelProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  // ── State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("rent");
  const [tag, setTag] = useState<string>(""); // slug; "" = tất cả
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([]);
  const [price, setPrice] = useState("");
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);

  // Dirty flags — parser won't overwrite fields user has explicitly set
  const dirtyFields = useRef<Set<"listingType" | "price" | "locations">>(new Set());

  // Derived
  const currentPriceRanges = PRICE_RANGES[listingType];
  const placeholderKey =
    listingType === "sale"
      ? "home.search_placeholder_apartment_sale"
      : "home.search_placeholder_apartment_rent";
  const currentPlaceholder = t(placeholderKey as Parameters<typeof t>[0]);

  const hasActiveFilters =
    !!searchQuery || selectedLocations.length > 0 || !!price || !!tag || listingType !== "rent";

  // ── NLP Parser ────────────────────────────────────────────
  const parserTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (parserTimer.current) clearTimeout(parserTimer.current);
      parserTimer.current = setTimeout(() => {
        const parsed = parseSearchQuery(text);

        // Chỉ lấy phần listingType từ parser (bỏ phần propertyType)
        if (parsed.propertyMode && !dirtyFields.current.has("listingType")) {
          const lt = parsed.propertyMode.split("-")[1];
          if (lt === "sale" || lt === "rent") {
            setListingType(lt);
            setPrice("");
          }
        }

        if (!dirtyFields.current.has("price")) {
          if (parsed.priceMin !== undefined || parsed.priceMax !== undefined) {
            const lt = (parsed.propertyMode?.split("-")[1] as "sale" | "rent") || listingType;
            const ranges = PRICE_RANGES[lt] ?? [];
            for (const range of ranges) {
              const [rMin, rMax] = range.value.split("-").map(Number);
              const matchMin = parsed.priceMin === undefined || parsed.priceMin >= rMin;
              const matchMax =
                parsed.priceMax === undefined || (!rMax ? true : parsed.priceMax <= rMax);
              if (matchMin && matchMax) {
                setPrice(range.value);
                break;
              }
            }
          }
        }

        if (parsed.locationQuery && !dirtyFields.current.has("locations")) {
          const locLower = parsed.locationQuery.toLowerCase();
          const matched = locations.find((l) => (l.title as string).toLowerCase().includes(locLower));
          if (matched) {
            setSelectedLocations([
              {
                id: matched.id,
                slug: matched.slug as string,
                title: matched.title as string,
                level: matched.level as "city" | "district" | "ward",
              },
            ]);
          }
        }
      }, 400);
    },
    [locations, listingType],
  );

  // ── Submit ────────────────────────────────────────────────
  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    const parsed = parseSearchQuery(searchQuery);

    if (parsed.cleanedQuery) params.set("q", parsed.cleanedQuery);
    if (parsed.bedrooms) params.set("bedrooms", String(parsed.bedrooms));
    if (tag) params.set("tag", tag);
    if (listingType) params.set("type", listingType);

    if (selectedLocations.length > 0) {
      params.set("location", selectedLocations.map((l) => l.slug).join(","));
    }

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

  const resetAll = () => {
    setSearchQuery("");
    setListingType("rent");
    setTag("");
    setSelectedLocations([]);
    setPrice("");
    dirtyFields.current.clear();
    router.push(agentSlug ? `/${locale}/${agentSlug}/apartments` : `/${locale}/search`);
  };

  // ── IntersectionObserver: track khi SearchFunnel gốc ra khỏi viewport ──
  const funnelRef = useRef<HTMLDivElement>(null);
  const [funnelVisible, setFunnelVisible] = useState(true);

  useEffect(() => {
    const el = funnelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFunnelVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }, // 64px = header height
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [miniOpen, setMiniOpen] = useState(false);

  // Lock body scroll when mini dropdown is open
  useEffect(() => {
    if (miniOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [miniOpen]);

  return (
    <>
    {/* ── Mini Search Trigger (Mobile only, sticky dưới header) ── */}
    <AnimatePresence>
      {(compactMobile && !funnelVisible) && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed top-(--header-h) inset-x-0 z-40 md:hidden"
        >
          {/* Trigger bar */}
          <button
            type="button"
            onClick={() => setMiniOpen(!miniOpen)}
            className="w-full flex items-center gap-2.5 h-11 px-4 bg-background/95 backdrop-blur-md border-b border-border shadow-sm text-left"
          >
            <MagnifyingGlassIcon className="w-4 h-4 text-foreground-muted shrink-0" />
            <span className="text-sm text-foreground-muted truncate flex-1">
              {searchQuery || currentPlaceholder}
            </span>
            <CaretDownIcon className={`w-3.5 h-3.5 text-foreground-muted shrink-0 transition-transform duration-200 ${miniOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {miniOpen && (
              <div key="mini-dropdown">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 top-[calc(var(--header-h)+2.75rem)] bg-black/40 backdrop-blur-sm"
                  onClick={() => setMiniOpen(false)}
                />
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden bg-background border-b border-border shadow-lg relative z-10"
                >
                <form onSubmit={(e) => { handleSearch(e); setMiniOpen(false); }} className="p-3 flex flex-col gap-2.5">
                  {/* Listing type tabs + reset */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => { dirtyFields.current.add("listingType"); setListingType("rent"); setPrice(""); }}
                      className={`text-xs font-medium pb-1 border-b-2 transition-colors ${listingType === "rent" ? "border-primary text-primary" : "border-transparent text-foreground-muted"}`}
                    >
                      {t("apartments.for_rent")}
                    </button>
                    <button
                      type="button"
                      onClick={() => { dirtyFields.current.add("listingType"); setListingType("sale"); setPrice(""); }}
                      className={`text-xs font-medium pb-1 border-b-2 transition-colors ${listingType === "sale" ? "border-primary text-primary" : "border-transparent text-foreground-muted"}`}
                    >
                      {t("apartments.for_sale")}
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetAll}
                        className="ml-auto flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
                      >
                        <ArrowsCounterClockwiseIcon className="w-3.5 h-3.5" />
                        {t("apartments.reset_filters")}
                      </button>
                    )}
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={currentPlaceholder}
                      className="w-full h-10 pl-9 pr-3 bg-background-subtle border border-border text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>

                  {/* Tag + Price row */}
                  <div className="flex gap-2">
                    {tags.length > 0 && (
                      <div className="relative flex-1">
                        <BuildingsIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                        <select
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          className="w-full h-10 pl-9 pr-3 bg-background-subtle border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary"
                        >
                          <option value="">{t("apartments.filter_all")}</option>
                          {tags.map((tg) => (
                            <option key={tg.slug} value={tg.slug}>{tg.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="relative flex-1">
                      <CurrencyCircleDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                      <select
                        value={price}
                        onChange={(e) => { dirtyFields.current.add("price"); setPrice(e.target.value); }}
                        className="w-full h-10 pl-9 pr-3 bg-background-subtle border border-border text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary"
                      >
                        <option value="">{t("home.filter_price")}</option>
                        {currentPriceRanges.map((r) => (
                          <option key={r.value} value={r.value}>
                            {t(r.labelKey as Parameters<typeof t>[0])}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setLocationPanelOpen(true); setMiniOpen(false); }}
                    onKeyDown={(e) => e.key === "Enter" && setLocationPanelOpen(true)}
                    className="flex items-center w-full h-10 px-3 bg-background-subtle border border-border text-left cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4 text-foreground-muted shrink-0 mr-2" />
                    {selectedLocations.length === 0 ? (
                      <span className="text-foreground-muted text-sm">{t("apartments.location_trigger")}</span>
                    ) : (
                      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                        {selectedLocations.slice(0, 2).map((loc) => (
                          <span key={loc.id} className="bg-secondary/10 text-secondary text-xs font-medium px-1.5 py-0.5 shrink-0">
                            {loc.title}
                          </span>
                        ))}
                        {selectedLocations.length > 2 && (
                          <span className="text-xs text-foreground-muted">+{selectedLocations.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full h-10 flex items-center justify-center gap-2">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    {t("home.search_btn")}
                  </Button>
                </form>
              </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── Full Search Funnel ── */}
    <motion.div
      ref={funnelRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`w-full bg-background p-4 md:p-6 shadow-xl border border-border/50`}
    >
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        {/* Tabs: Sale vs Rent */}
        <div className="flex items-center gap-6 mb-1 px-2">
          <button
            type="button"
            onClick={() => {
              dirtyFields.current.add("listingType");
              setListingType("rent");
              setPrice("");
            }}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${listingType === "rent" ? "border-primary text-primary" : "border-transparent text-foreground-muted hover:text-foreground"}`}
          >
            <KeyIcon weight={listingType === "rent" ? "fill" : "regular"} className="w-4 h-4" />
            {t("apartments.for_rent")}
          </button>
          <button
            type="button"
            onClick={() => {
              dirtyFields.current.add("listingType");
              setListingType("sale");
              setPrice("");
            }}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-1.5 ${listingType === "sale" ? "border-primary text-primary" : "border-transparent text-foreground-muted hover:text-foreground"}`}
          >
            <TagIcon weight={listingType === "sale" ? "fill" : "regular"} className="w-4 h-4" />
            {t("apartments.for_sale")}
          </button>
          {/* Inline reset (mobile) */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="ml-auto flex md:hidden items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowsCounterClockwiseIcon className="w-3.5 h-3.5" />
              {t("apartments.reset_filters")}
            </button>
          )}
        </div>

        {/* Row 1: Tag + Text Search + Submit */}
        <div className="flex flex-col md:flex-row items-stretch w-full bg-background border border-border shadow-sm divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Tag (loại hình tự do) */}
          {tags.length > 0 && (
            <div className="relative md:w-56 w-full py-1 shrink-0">
              <BuildingsIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none z-10" />
              <CaretDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none z-10" />
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full h-14 pl-12 pr-10 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-sm appearance-none cursor-pointer"
              >
                <option value="">{t("apartments.filter_all")}</option>
                {tags.map((tg) => (
                  <option key={tg.slug} value={tg.slug}>
                    {tg.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Text Search — with NLP parser */}
          <div className="relative flex-1 w-full py-1">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full h-14 pl-12 pr-5 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground text-sm placeholder:text-foreground-muted"
            />
          </div>

          {/* Desktop Submit */}
          <div className="hidden md:flex w-auto p-1.5 items-center gap-2">
            <AnimatePresence>
              {hasActiveFilters && (
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
                    onClick={resetAll}
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
              className="h-full min-h-[48px] px-8 flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {t("home.search_btn")}
            </Button>
          </div>
        </div>

        {/* Row 2: Location trigger + Price */}
        <div className="flex flex-col md:flex-row items-stretch w-full bg-background border border-border shadow-sm divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Location — trigger button */}
          <div className="relative flex-1 w-full py-1">
            <MapPinIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted pointer-events-none z-10" />
            <div
              role="button"
              tabIndex={0}
              onClick={() => setLocationPanelOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && setLocationPanelOpen(true)}
              className="flex items-center w-full h-14 pl-12 pr-4 text-left hover:bg-secondary/5 transition-colors min-w-0 cursor-pointer"
            >
              {selectedLocations.length === 0 ? (
                <span className="text-foreground-muted text-sm">{t("apartments.location_trigger")}</span>
              ) : (
                <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                  {selectedLocations.slice(0, 2).map((loc) => (
                    <span
                      key={loc.id}
                      className="flex items-center gap-1 bg-secondary/10 text-secondary text-xs font-medium px-2 py-1 shrink-0"
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
                  className="ml-auto shrink-0 text-foreground-muted hover:text-foreground transition-colors relative z-20"
                >
                  <XCircleIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Price — dynamic theo listingType */}
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
              {currentPriceRanges.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.labelKey as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Submit */}
        <div className="flex md:hidden w-full mt-2">
          <Button type="submit" className="w-full h-12 flex items-center justify-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5" />
            {t("home.search_btn")}
          </Button>
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
    </>
  );
};
