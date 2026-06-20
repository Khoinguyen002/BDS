"use client";

import React from "react";

export default function SectionDivider({ label }: { label?: string }) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--theme-elevation-150)",
        paddingTop: "16px",
        marginTop: "8px",
        marginBottom: "4px",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--theme-text)",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
