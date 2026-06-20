"use client";

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { XIcon, CheckIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Location } from "@bds/shared/payload-types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface SelectedLocation {
  id: number;
  slug: string;
  title: string;
  level: "city" | "district" | "ward";
}

interface LocationPanelProps {
  allLocations: Location[];
  value: SelectedLocation[];
  onChange: (selected: SelectedLocation[]) => void;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// Column item
// ─────────────────────────────────────────────────────────────
function ColumnItem({
  loc,
  checked,
  partial,
  focused,
  disabled,
  hasChildren,
  onCheck,
  onFocus,
  titleSuffix,
}: {
  loc: Location;
  checked: boolean;
  partial?: boolean;   // has children selected but not itself
  focused: boolean;
  disabled: boolean;
  hasChildren: boolean;
  onCheck: () => void;
  onFocus: () => void;
  titleSuffix?: string;
}) {
  const isActive = checked || partial;
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onCheck();
          if (hasChildren) onFocus();
        }
      }}
      onMouseEnter={() => hasChildren && onFocus()}
      className={`
        flex items-center justify-between px-3 py-2.5 cursor-pointer select-none
        border-b border-border/40 last:border-b-0
        transition-colors duration-100
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-primary/5"}
        ${focused && !disabled ? "bg-primary/8" : ""}
      `}
    >
      {/* Checkbox */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`
            w-4 h-4 shrink-0 border flex items-center justify-center
            transition-colors
            ${isActive ? "bg-primary border-primary" : "border-border bg-background"}
            ${disabled && !isActive ? "opacity-50" : ""}
          `}
        >
          {checked && <CheckIcon className="w-3 h-3 text-white" weight="bold" />}
          {partial && !checked && (
            <span className="w-2 h-0.5 bg-white block" />
          )}
        </div>
        <span className={`text-sm truncate ${isActive ? "text-primary font-medium" : "text-foreground"}`}>
          {loc.title as string}
          {titleSuffix && <span className="text-foreground-muted font-normal ml-1">{titleSuffix}</span>}
        </span>
      </div>

      {/* Arrow if has children */}
      {hasChildren && (
        <CaretRightIcon
          className={`w-4 h-4 shrink-0 transition-colors ${focused ? "text-primary" : "text-foreground-muted"}`}
        />
      )}
      {disabled && !checked && (
        <span className="text-xs text-foreground-muted ml-2 shrink-0">✓ quận đã chọn</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────
import { useLocationPanel } from "@bds/shared/hooks/useLocationPanel";

export const LocationPanel = ({
  allLocations,
  value,
  onChange,
  onClose,
}: LocationPanelProps) => {
  const t = useTranslations();
  
  const {
    searchQuery,
    setSearchQuery,
    searchLower,
    focusedDistrictId,
    setFocusedDistrictId,
    selectedIds,
    disabledIds,
    partialDistrictIds,
    districts,
    activeWards,
    hasWardChildren,
    toggle,
    selectedDistricts,
    selectedWards,
    searchResults,
    cityForDistricts,
    getParentId
  } = useLocationPanel({ allLocations, value, onChange });

  useEffect(() => {
    // Lock body scroll when panel is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-zinc-950/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full md:w-auto md:min-w-[640px] md:max-w-[820px] bg-background border border-border shadow-2xl flex flex-col max-h-[85vh] md:max-h-[520px]"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">{t("apartments.select_location")}</span>
            {value.length > 0 && (
              <span className="text-xs text-foreground-muted">
                {value.length} đã chọn
                {selectedDistricts.length > 0 && ` (${selectedDistricts.length} quận/huyện`}
                {selectedWards.length > 0 && `, ${selectedWards.length} phường/xã)`}
                {selectedDistricts.length > 0 && selectedWards.length === 0 && ")"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-foreground-muted hover:text-foreground transition-colors"
              >
                Xoá tất cả
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <XIcon className="w-4 h-4 text-foreground-muted" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-border shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("apartments.search_location_placeholder")}
            className="w-full h-10 px-3 bg-zinc-100 dark:bg-zinc-800 border-none rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground placeholder:text-foreground-muted"
            autoFocus
          />
        </div>

        {/* 3-column body or flat search results */}
        <div className="flex flex-1 min-h-0">
          {searchLower ? (
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground-muted">
                  Không tìm thấy khu vực nào phù hợp
                </div>
              ) : (
                searchResults.map((loc: Location) => {
                  let parentName = "";
                  if (loc.level === "ward") {
                    const parentId = getParentId(loc);
                    const parent = allLocations.find((l) => l.id === parentId);
                    if (parent) parentName = parent.title as string;
                  }
                  return (
                    <ColumnItem
                      key={loc.id}
                      loc={loc}
                      checked={selectedIds.has(loc.id)}
                      partial={false}
                      focused={false}
                      disabled={disabledIds.has(loc.id)}
                      hasChildren={false}
                      onCheck={() => toggle(loc)}
                      onFocus={() => {}}
                      titleSuffix={parentName ? `- ${parentName}` : ""}
                    />
                  );
                })
              )}
            </div>
          ) : (
            <>
              {/* Col 1: TP.HCM + Districts */}
              <div className="flex flex-col border-r border-border min-w-[200px] max-w-[220px]">
            {/* City header — always shown, pre-selected state */}
            <div className="px-3 py-2 border-b border-border bg-zinc-50 dark:bg-zinc-900">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {t("apartments.city")}
              </span>
            </div>
            <div className="border-b border-border bg-primary/5 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-primary border border-primary flex items-center justify-center shrink-0">
                  <CheckIcon className="w-3 h-3 text-white" weight="bold" />
                </div>
                <span className="text-sm font-medium text-primary">
                  {cityForDistricts ? (cityForDistricts.title as string) : "TP. Hồ Chí Minh"}
                </span>
              </div>
            </div>
            {/* Districts */}
            <div className="overflow-y-auto flex-1">
              <div className="px-3 py-1.5 border-b border-border/40">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t("apartments.district")}
                </span>
              </div>
              {districts.map((d: Location) => (
                <ColumnItem
                  key={d.id}
                  loc={d}
                  checked={selectedIds.has(d.id)}
                  partial={partialDistrictIds.has(d.id)}
                  focused={focusedDistrictId === d.id}
                  disabled={false}
                  hasChildren={hasWardChildren(d.id)}
                  onCheck={() => toggle(d)}
                  onFocus={() => setFocusedDistrictId(d.id)}
                />
              ))}
            </div>
          </div>

          {/* Col 2: Wards of focused district */}
          {focusedDistrictId ? (
            <div className="flex flex-col flex-1 min-w-0">
              <div className="px-3 py-2 border-b border-border bg-zinc-50 dark:bg-zinc-900">
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                  {t("apartments.ward")}
                  {selectedIds.has(focusedDistrictId) && (
                    <span className="ml-2 text-primary normal-case font-normal">
                      · Đã chọn cả quận
                    </span>
                  )}
                </span>
              </div>
              <div className="overflow-y-auto flex-1">
                {activeWards.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-foreground-muted text-center">
                    Không có phường/xã
                  </div>
                ) : (
                  activeWards.map((w: Location) => (
                    <ColumnItem
                      key={w.id}
                      loc={w}
                      checked={selectedIds.has(w.id)}
                      focused={false}
                      disabled={disabledIds.has(w.id)}
                      hasChildren={false}
                      onCheck={() => toggle(w)}
                      onFocus={() => {}}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-foreground-muted">
              <span>{t("apartments.select_district_first")}</span>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
          <span className="text-sm text-foreground-muted">
            {value.length === 0
              ? t("apartments.no_location_selected")
              : `Đã chọn: ${value.map((v) => v.title).join(", ")}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t("apartments.done")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
