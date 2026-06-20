"use client";

import { useRowLabel } from "@payloadcms/ui";

// Nhãn từng dòng cho array `sections`: hiện tiêu đề thay vì "Section 01".
export function SectionRowLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string }>();
  const index = String((rowNumber ?? 0) + 1).padStart(2, "0");
  return <span>{data?.title?.trim() || `Section ${index}`}</span>;
}
