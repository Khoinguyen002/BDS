"use client";

import React from "react";
import { useField } from "@payloadcms/ui";

export function ColorPickerField({ path, label }: { path: string; label?: string }) {
  const { value, setValue } = useField<string>({ path });

  return (
    <div className="field-type text" style={{ marginBottom: "20px" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "8px" }}>
        {label || "Brand Primary Color"}
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
