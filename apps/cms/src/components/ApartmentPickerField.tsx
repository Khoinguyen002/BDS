/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useField, useFormFields, useTranslation } from "@payloadcms/ui";

type ApartmentDoc = {
  id: number;
  title: string;
  listingType?: "sale" | "rent" | null;
  tags?: { id: number; title: string; slug: string }[];
  slug?: string;
  gallery?: { url?: string }[];
};

type TagDoc = { id: number; title: string; slug: string };

export function ApartmentPickerField({ path, field }: { path: string; field: any }) {
  const { value, setValue } = useField<number[]>({ path });
  const { t } = useTranslation();

  // Try to get the owner from form data to filter apartments
  const ownerField = useFormFields(([fields]) => fields?.owner);
  const ownerId =
    typeof ownerField?.value === "object" && ownerField?.value !== null
      ? (ownerField.value as { id: number }).id || ownerField.value
      : ownerField?.value;

  const [isOpen, setIsOpen] = useState(false);
  const [apartments, setApartments] = useState<ApartmentDoc[]>([]);
  const [allTags, setAllTags] = useState<TagDoc[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | "sale" | "rent">("");
  const [filterTag, setFilterTag] = useState("");

  // Local selection (synced from value on open)
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Fetch apartments
  const fetchApartments = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/apartments?limit=500&depth=1&sort=-createdAt";
      if (ownerId) url += `&where[owner][equals]=${ownerId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.docs) setApartments(data.docs);
    } catch (e) {
      console.error("Failed to fetch apartments", e);
    }
    setLoading(false);
  }, [ownerId]);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/tags?limit=100&depth=0");
      const data = await res.json();
      if (data.docs) setAllTags(data.docs);
    } catch (e) {
      console.error("Failed to fetch tags", e);
    }
  }, []);

  // Data fetching and prop syncing is now handled on open click

  // Filtered list
  const filtered = useMemo(() => {
    let list = apartments;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (filterType) {
      list = list.filter((a) => a.listingType === filterType);
    }
    if (filterTag) {
      list = list.filter((a) =>
        a.tags?.some((t) => t.slug === filterTag)
      );
    }
    return list;
  }, [apartments, search, filterType, filterTag]);

  // Selection helpers
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((a) => next.add(a.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((a) => next.delete(a.id));
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const confirmSelection = () => {
    setValue(Array.from(selected));
    setIsOpen(false);
  };

  // Resolve selected names for display
  const selectedNames = useMemo(() => {
    if (!Array.isArray(value) || value.length === 0) return [];
    return value
      .map((id) => {
        const apt = apartments.find((a) => a.id === id);
        return apt ? apt.title : `#${id}`;
      });
  }, [value, apartments]);

  // All filtered are selected?
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((a) => selected.has(a.id));

  // Styles
  const btnStyle: React.CSSProperties = {
    padding: "6px 14px",
    border: "1px solid var(--theme-elevation-150)",
    background: "var(--theme-elevation-50)",
    color: "var(--theme-text)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  };

  const btnPrimary: React.CSSProperties = {
    ...btnStyle,
    background: "var(--theme-elevation-800)",
    color: "var(--theme-bg)",
    border: "none",
  };

  return (
    <div className="field-type relationship" style={{ marginBottom: "20px" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>
        {typeof field?.label === "object" ? field.label.vi || field.label.en : field?.label || "Chọn căn hộ"}
      </label>

      {/* Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setSelected(new Set(Array.isArray(value) ? value : []));
            fetchApartments();
            fetchTags();
          }}
          style={btnPrimary}
        >
          {t('custom:apartmentPicker:quickSelect' as any)} ({Array.isArray(value) ? value.length : 0})
        </button>
        {Array.isArray(value) && value.length > 0 && (
          <button type="button" onClick={() => setValue([])} style={{ ...btnStyle, color: "var(--theme-error-500)" }}>
            {t('custom:apartmentPicker:clearAll' as any)}
          </button>
        )}
      </div>

      {/* Tags of selected */}
      {selectedNames.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            padding: "10px",
            border: "1px solid var(--theme-elevation-150)",
            background: "var(--theme-elevation-50)",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        >
          {selectedNames.map((name, i) => (
            <span
              key={i}
              style={{
                fontSize: "12px",
                padding: "3px 8px",
                background: "var(--theme-elevation-100)",
                border: "1px solid var(--theme-elevation-200)",
                color: "var(--theme-text)",
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            style={{
              width: "min(95vw, 700px)",
              maxHeight: "85vh",
              background: "var(--theme-bg)",
              border: "1px solid var(--theme-elevation-150)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--theme-elevation-150)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "16px" }}>
                {t('custom:apartmentPicker:modalTitle' as any)}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--theme-text)",
                  fontSize: "20px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--theme-elevation-150)",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('custom:apartmentPicker:searchPlaceholder' as any)}
                style={{
                  flex: "1 1 200px",
                  padding: "8px 12px",
                  border: "1px solid var(--theme-elevation-150)",
                  background: "var(--theme-elevation-50)",
                  color: "var(--theme-text)",
                  fontSize: "13px",
                }}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "" | "sale" | "rent")}
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--theme-elevation-150)",
                  background: "var(--theme-elevation-50)",
                  color: "var(--theme-text)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="">{t('custom:apartmentPicker:allTypes' as any)}</option>
                <option value="sale">{t('custom:apartmentPicker:sale' as any)}</option>
                <option value="rent">{t('custom:apartmentPicker:rent' as any)}</option>
              </select>
              {allTags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--theme-elevation-150)",
                    background: "var(--theme-elevation-50)",
                    color: "var(--theme-text)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <option value="">{t('custom:apartmentPicker:allTags' as any)}</option>
                  {allTags.map((tag) => (
                    <option key={tag.slug} value={tag.slug}>
                      {tag.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Bulk actions */}
            <div
              style={{
                padding: "8px 20px",
                borderBottom: "1px solid var(--theme-elevation-150)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                color: "var(--theme-elevation-500)",
              }}
            >
              <span>
                {filtered.length} {t('custom:apartmentPicker:apartments' as any)} · {selected.size} {t('custom:apartmentPicker:selected' as any)}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={selectAllFiltered} style={btnStyle}>
                  {allFilteredSelected ? t('custom:apartmentPicker:allSelected' as any) : `${t('custom:apartmentPicker:selectAll' as any)} (${filtered.length})`}
                </button>
                <button type="button" onClick={deselectAllFiltered} style={btnStyle}>
                  {t('custom:apartmentPicker:deselectFiltered' as any)}
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{ ...btnStyle, color: "var(--theme-error-500)" }}
                >
                  {t('custom:apartmentPicker:clearSelection' as any)}
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
              {loading ? (
                <div style={{ padding: "0" }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 20px",
                        borderBottom: "1px solid var(--theme-elevation-100)",
                        animation: "skeletonPulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 0.08}s`,
                      }}
                    >
                      {/* Checkbox skeleton */}
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          background: "var(--theme-elevation-150)",
                          flexShrink: 0,
                        }}
                      />
                      {/* Content skeleton */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div
                          style={{
                            height: "14px",
                            width: `${55 + (i % 3) * 15}%`,
                            background: "var(--theme-elevation-150)",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              height: "10px",
                              width: "40px",
                              background: "var(--theme-elevation-100)",
                            }}
                          />
                          <div
                            style={{
                              height: "10px",
                              width: "60px",
                              background: "var(--theme-elevation-100)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <style>{`
                    @keyframes skeletonPulse {
                      0%, 100% { opacity: 1; }
                      50% { opacity: 0.4; }
                    }
                  `}</style>
                </div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--theme-elevation-400)",
                  }}
                >
                  {t('custom:apartmentPicker:noResults' as any)}
                </div>
              ) : (
                filtered.map((apt) => {
                  const isSelected = selected.has(apt.id);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => toggleOne(apt.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--theme-elevation-100)",
                        background: isSelected
                          ? "var(--theme-elevation-100)"
                          : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          (e.currentTarget as HTMLDivElement).style.background =
                            "var(--theme-elevation-50)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          isSelected
                            ? "var(--theme-elevation-100)"
                            : "transparent";
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          border: isSelected
                            ? "2px solid var(--theme-elevation-800)"
                            : "2px solid var(--theme-elevation-300)",
                          background: isSelected
                            ? "var(--theme-elevation-800)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "12px",
                          color: "var(--theme-bg)",
                        }}
                      >
                        {isSelected && "✓"}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {apt.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--theme-elevation-400)",
                            display: "flex",
                            gap: "8px",
                            marginTop: "2px",
                          }}
                        >
                          {apt.listingType && (
                            <span
                              style={{
                                padding: "1px 6px",
                                background:
                                  apt.listingType === "sale"
                                    ? "rgba(5, 150, 105, 0.15)"
                                    : "rgba(245, 158, 11, 0.15)",
                                color:
                                  apt.listingType === "sale"
                                    ? "#059669"
                                    : "#d97706",
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                              }}
                            >
                              {apt.listingType === "sale" ? t('custom:apartmentPicker:sale' as any) : t('custom:apartmentPicker:rent' as any)}
                            </span>
                          )}
                          {apt.tags?.map((tag) => (
                            <span key={tag.id} style={{ opacity: 0.7 }}>
                              {tag.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--theme-elevation-150)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={btnStyle}
              >
                {t('custom:apartmentPicker:cancel' as any)}
              </button>
              <button type="button" onClick={confirmSelection} style={btnPrimary}>
                {t('custom:apartmentPicker:confirm' as any)} ({selected.size} {t('custom:apartmentPicker:unit' as any)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
