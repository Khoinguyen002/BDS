"use client";

import React from "react";
import type { UIField } from "payload";

export default function BlockImagePreview(props: { field: UIField }) {
  const custom = props.field?.admin?.custom;
  const imageURL = custom?.imageURL as string | undefined;

  if (!imageURL) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          fontSize: "13px",
          color: "var(--theme-elevation-400)",
          marginBottom: "8px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Ảnh minh họa Block
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageURL}
        alt="Block Preview"
        style={{
          width: "100%",
          maxWidth: "400px",
          aspectRatio: "3/2",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid var(--theme-elevation-150)",
          display: "block",
          backgroundColor: "var(--theme-elevation-50)",
        }}
      />
    </div>
  );
}
