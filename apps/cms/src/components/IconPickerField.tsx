"use client";

import React, { useState, useMemo } from "react";
import { useField } from "@payloadcms/ui";
import * as PhosphorIcons from "@phosphor-icons/react";

// Get all icon names (filter out non-components)
const iconNames = Object.keys(PhosphorIcons).filter(
  (key) => /^[A-Z]/.test(key) && !key.endsWith("Context") && key !== "SSR"
);

export function IconPickerField({ path, label }: { path: string; label?: string }) {
  const { value, setValue } = useField<string>({ path });
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Limit to 50 results to prevent UI freeze
  const filteredIcons = useMemo(() => {
    if (!search) return iconNames.slice(0, 50);
    return iconNames
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [search]);

  // Current Icon component to render preview
  const CurrentIcon = value ? (PhosphorIcons as unknown as Record<string, React.ElementType>)[value] : null;

  return (
    <div className="field-type text" style={{ marginBottom: "20px" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>
        {label || "Icon Component Name"}
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div 
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--theme-elevation-150)",
            borderRadius: "4px",
            color: "var(--theme-text)"
          }}
        >
          {CurrentIcon ? <CurrentIcon size={24} weight="regular" /> : "?"}
        </div>
        
        <input
          type="text"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. SwimmingPool"
          style={{
            height: "40px",
            padding: "0 10px",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: "4px",
            background: "var(--theme-bg)",
            color: "var(--theme-text)",
            flex: 1,
            maxWidth: "300px"
          }}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            height: "40px",
            padding: "0 16px",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: "4px",
            background: "var(--theme-elevation-50)",
            color: "var(--theme-text)",
            cursor: "pointer"
          }}
        >
          {isOpen ? "Close Picker" : "Browse Icons"}
        </button>
      </div>

      {isOpen && (
        <div style={{
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: "4px",
          padding: "16px",
          background: "var(--theme-elevation-50)",
          marginTop: "8px"
        }}>
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              padding: "0 10px",
              marginBottom: "16px",
              border: "1px solid var(--theme-elevation-150)",
              borderRadius: "4px",
              background: "var(--theme-bg)",
              color: "var(--theme-text)",
            }}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
            gap: "12px",
            maxHeight: "300px",
            overflowY: "auto",
            padding: "4px"
          }}>
            {filteredIcons.map((name) => {
              const IconComp = (PhosphorIcons as unknown as Record<string, React.ElementType>)[name];
              if (!IconComp) return null;
              
              const isSelected = value === name;
              
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    setValue(name);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px",
                    border: isSelected ? "2px solid #2563eb" : "1px solid var(--theme-elevation-150)",
                    borderRadius: "4px",
                    background: "var(--theme-bg)",
                    color: "var(--theme-text)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <IconComp size={24} weight="regular" />
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 50 && (
            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "var(--theme-text-dim)" }}>
              Showing first 50 results. Keep typing to refine.
            </p>
          )}
          {filteredIcons.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "12px", color: "var(--theme-text-dim)" }}>
              No icons found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
