"use client";

import React from "react";
import { useField } from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";

export function ColorPickerField({ path, field }: TextFieldClientProps) {
  const { value, setValue } = useField<string>({ path });

  // Payload may pass label as string or localized object { vi, en }
  const rawLabel = field?.label;
  const displayLabel =
    typeof rawLabel === "string"
      ? rawLabel
      : typeof rawLabel === "object" && rawLabel !== null
        ? (rawLabel as Record<string, string>)["vi"] || (rawLabel as Record<string, string>)["en"] || "Color"
        : "Color";

  return (
    <div className="field-type text" style={{ marginBottom: "20px" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>
        {displayLabel}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="color"
          value={value || "#2563eb"}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: "40px",
            height: "40px",
            padding: "0",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#2563eb"
          style={{
            height: "40px",
            padding: "0 10px",
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: "4px",
            background: "var(--theme-bg)",
            color: "var(--theme-text)",
            flex: 1,
            maxWidth: "200px"
          }}
        />
      </div>
    </div>
  );
}


