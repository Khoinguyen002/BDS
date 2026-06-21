import type { PayloadRequest } from "payload";
import { REVERSE_DEPS } from "@bds/shared/cache-tags";
import { env } from "../env";

// ── Debounce / coalescing ────────────────────────────────────────────
// Gom mọi tags phát sinh trong cửa sổ FLUSH_MS rồi gửi 1 request duy nhất.
// Khử trùng lặp qua Set. Dùng fixed-window (không reset timer mỗi lần gọi)
// để tránh starvation khi update liên tục.
//
// Cache invalidate CHỈ qua tag (không còn path). Lưu ý: state nằm in-memory
// của process CMS (long-running node). Nếu process thoát trong cửa sổ flush
// thì các revalidation đang chờ sẽ mất — chấp nhận được.
const FLUSH_MS = 500;

let pendingTags = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const postRevalidate = async (body: Record<string, unknown>) => {
  return fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.REVALIDATE_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

const flush = async () => {
  flushTimer = null;
  const tags = [...pendingTags];
  pendingTags = new Set();
  if (!tags.length) return;
  try {
    await postRevalidate({ tags });
  } catch (err) {
    console.error("Revalidation flush error", err);
  }
};

const scheduleFlush = () => {
  if (flushTimer) return; // đã có flush đang chờ trong cửa sổ hiện tại
  flushTimer = setTimeout(() => {
    void flush();
  }, FLUSH_MS);
};

/**
 * Purge cache tag(s) — KHÔNG cascade.
 * Dùng cho leaf collections (không bị reference bởi collection khác).
 */
export const triggerRevalidateTag = ({
  tag,
  req,
}: {
  tag: string | string[];
  req?: PayloadRequest;
}) => {
  void req; // giữ chữ ký cũ; lỗi được log trong flush
  const tags = Array.isArray(tag) ? tag : [tag];
  for (const t of tags) pendingTags.add(t);
  scheduleFlush();
};

/**
 * Purge cache tag(s) + tự động cascade purge các collection phụ thuộc.
 * Dùng cho collections bị reference bởi collection khác (xem REVERSE_DEPS).
 *
 * VD: triggerRevalidateWithCascade({ tag: "amenities", req })
 *   → purge "amenities" + "apartments" (vì apartments reference amenities)
 */
export const triggerRevalidateWithCascade = ({
  tag,
  req,
}: {
  tag: string | string[];
  req?: PayloadRequest;
}) => {
  const inputTags = Array.isArray(tag) ? tag : [tag];
  const allTags = new Set(inputTags);

  for (const t of inputTags) {
    const deps = REVERSE_DEPS[t];
    if (deps) {
      for (const dep of deps) allTags.add(dep);
    }
  }

  triggerRevalidateTag({ tag: [...allTags], req });
};
