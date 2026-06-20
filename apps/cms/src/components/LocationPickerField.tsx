"use client";

import React, { useState, useEffect } from "react";
import { useField, useTranslation } from "@payloadcms/ui";
import { useLocationPanel, type SelectedLocation } from "@bds/shared/hooks/useLocationPanel";
import type { Location } from "@bds/shared/payload-types";

// This is the custom UI for selecting a Ward in the CMS
export function LocationPickerField({ path }: { path: string }) {
  const { value, setValue } = useField<number>({ path });
  const { t } = useTranslation();
  type PayloadT = Parameters<typeof t>[0];
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch locations
  useEffect(() => {
    fetch("/api/locations?limit=1000&depth=0")
      .then((res) => res.json())
      .then((data) => {
        if (data.docs) setAllLocations(data.docs);
      })
      .catch(console.error);
  }, []);

  // Map CMS single ID to the array format expected by the hook
  const selectedLoc = value
    ? allLocations.find((l) => l.id === value)
    : undefined;
  const hookValue: SelectedLocation[] = selectedLoc
    ? [
        {
          id: selectedLoc.id,
          slug: (selectedLoc.slug as string) || "",
          title: (selectedLoc.title as string) || "",
          level: selectedLoc.level as "city" | "district" | "ward",
        },
      ]
    : [];

  const handleHookChange = (newSelected: SelectedLocation[]) => {
    // For CMS apartment region, it's a single select.
    // If user selects a new one, we just take the last one or the newly added one.
    // Actually, if we just want single select, if newSelected has multiple, take the last one that is a ward.
    const wardsOnly = newSelected.filter((v) => v.level === "ward");
    if (wardsOnly.length > 0) {
      // If we clicked a new ward, it gets added. Take the last.
      setValue(wardsOnly[wardsOnly.length - 1].id);
      setIsOpen(false); // Auto close on select
    } else {
      setValue(null);
    }
  };

  const {
    searchQuery,
    setSearchQuery,
    searchLower,
    focusedDistrictId,
    setFocusedDistrictId,
    selectedIds,
    districts,
    activeWards,
    hasWardChildren,
    toggle,
    searchResults,
    cityForDistricts,
    getParentId,
  } = useLocationPanel({
    allLocations,
    value: hookValue,
    onChange: handleHookChange,
  });

  // Build full path: TP → Quận → Phường
  const getFullPath = (loc: Location): string => {
    const parts: string[] = [loc.title as string];
    let current = loc;
    while (current.parent) {
      const parentId = typeof current.parent === "object" ? (current.parent as Location).id : current.parent;
      const parent = allLocations.find((l) => l.id === parentId);
      if (parent) {
        parts.unshift(parent.title as string);
        current = parent;
      } else {
        break;
      }
    }
    return parts.join(" → ");
  };

  return (
    <div className="field-type relationship" style={{ marginBottom: "20px" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>
        {t('custom:locationPicker:label' as PayloadT)}
      </label>
      
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            width: "100%",
            padding: "10px 15px",
            textAlign: "left",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: "4px",
            background: "var(--theme-bg)",
            color: "var(--theme-text)",
            cursor: "pointer",
          }}
        >
          {selectedLoc ? getFullPath(selectedLoc) : t('custom:locationPicker:placeholder' as PayloadT)}
        </button>
      ) : (
        <div style={{ border: "1px solid var(--theme-elevation-150)", borderRadius: "4px", background: "var(--theme-bg)" }}>
          {/* Header */}
          <div style={{ padding: "10px", borderBottom: "1px solid var(--theme-elevation-150)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600 }}>{t('custom:locationPicker:title' as PayloadT)}</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--theme-text)" }}>{t('custom:locationPicker:close' as PayloadT)}</button>
          </div>
          
          {/* Search */}
          <div style={{ padding: "10px", borderBottom: "1px solid var(--theme-elevation-150)" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('custom:locationPicker:searchPlaceholder' as PayloadT)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid var(--theme-elevation-150)",
                borderRadius: "4px",
                background: "var(--theme-elevation-50)",
                color: "var(--theme-text)",
              }}
            />
          </div>

          <div style={{ display: "flex", height: "300px", overflow: "hidden" }}>
            {searchLower ? (
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {searchResults.length === 0 ? (
                  <div style={{ textAlign: "center", color: "var(--theme-elevation-400)", padding: "20px" }}>{t('custom:locationPicker:noResults' as PayloadT)}</div>
                ) : (
                  searchResults.map((loc: Location) => {
                    let parentName = "";
                    if (loc.level === "ward") {
                      const parentId = getParentId(loc);
                      const parent = allLocations.find((l) => l.id === parentId);
                      if (parent) parentName = parent.title as string;
                    }
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          if (loc.level === "ward") toggle(loc);
                        }}
                        style={{
                          padding: "8px 10px",
                          cursor: loc.level === "ward" ? "pointer" : "default",
                          background: selectedIds.has(loc.id) ? "var(--theme-elevation-100)" : "transparent",
                          opacity: loc.level === "ward" ? 1 : 0.5,
                        }}
                      >
                        {loc.title} {parentName && `- ${parentName}`}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <>
                {/* Districts */}
                <div style={{ width: "50%", borderRight: "1px solid var(--theme-elevation-150)", overflowY: "auto" }}>
                  <div style={{ padding: "5px 10px", fontSize: "12px", textTransform: "uppercase", background: "var(--theme-elevation-50)", color: "var(--theme-elevation-500)" }}>
                    {t('custom:locationPicker:district' as PayloadT)} ({cityForDistricts?.title})
                  </div>
                  {districts.map((d: Location) => (
                    <div
                      key={d.id}
                      onClick={() => setFocusedDistrictId(d.id)}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        background: focusedDistrictId === d.id ? "var(--theme-elevation-100)" : "transparent",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {d.title}
                      {hasWardChildren(d.id) && <span>›</span>}
                    </div>
                  ))}
                </div>

                {/* Wards */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <div style={{ padding: "5px 10px", fontSize: "12px", textTransform: "uppercase", background: "var(--theme-elevation-50)", color: "var(--theme-elevation-500)" }}>
                    {t('custom:locationPicker:ward' as PayloadT)}
                  </div>
                  {!focusedDistrictId ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--theme-elevation-400)" }}>{t('custom:locationPicker:selectDistrictFirst' as PayloadT)}</div>
                  ) : activeWards.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--theme-elevation-400)" }}>{t('custom:locationPicker:noWards' as PayloadT)}</div>
                  ) : (
                    activeWards.map((w: Location) => (
                      <div
                        key={w.id}
                        onClick={() => toggle(w)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          background: selectedIds.has(w.id) ? "var(--theme-elevation-100)" : "transparent",
                          fontWeight: selectedIds.has(w.id) ? "bold" : "normal",
                        }}
                      >
                        {selectedIds.has(w.id) && "✓ "} {w.title}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
