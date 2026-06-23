"use client";

import React from "react";
import { useField } from "@payloadcms/ui";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PermissionsTagFilter(props: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { value, setValue } = useField<any>({ path: props.path || "_blockFilter" });
  
  const filter = value || {};
  const searchQuery: string = filter.search || "";

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--theme-bg)",
          border: "1px solid var(--theme-elevation-100)",
          borderRadius: "4px",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "var(--theme-text)",
            }}
          >
            Tìm kiếm Component:
          </label>
          <input
            type="text"
            placeholder="Nhập tên block..."
            value={searchQuery}
            onChange={(e) => setValue({ ...filter, search: e.target.value })}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--theme-elevation-200)",
              borderRadius: "4px",
              backgroundColor: "var(--theme-input-bg)",
              color: "var(--theme-text)",
              outline: "none",
            }}
          />
        </div>

        {searchQuery && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setValue({ search: "" })}
              style={{
                padding: "0.35rem 0.5rem",
                borderRadius: "9999px",
                border: "none",
                background: "transparent",
                color: "var(--theme-error-500, #ef4444)",
                cursor: "pointer",
                fontSize: "0.875rem",
                textDecoration: "underline",
              }}
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
