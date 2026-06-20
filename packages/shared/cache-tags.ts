/**
 * cache-tags.ts
 *
 * Single source of truth cho Next.js cache tags. Web (fetch) GẮN tag, CMS hook
 * PURGE tag — hai bên phải khớp tuyệt đối, nên định nghĩa chung tại đây để
 * không bao giờ lệch chuỗi.
 *
 * Quy ước:
 * - Collection tag: bao mọi fetch dạng list/filter của collection đó. Bất kỳ
 *   thay đổi nào trong collection đều purge tag này → mọi list luôn tươi.
 * - Per-doc tag: định danh 1 document cụ thể (trang detail). Chỉ bị purge khi
 *   chính doc đó đổi → detail của doc khác KHÔNG bị bust oan.
 *
 * Lưu ý quan trọng: KHÔNG suy tag bằng regex từ endpoint nữa. Mỗi fetcher tự
 * khai báo tag tường minh bằng các hằng/builder dưới đây.
 */

// ── Collection-level tags (list / filter fetches) ──────────────────────
export const COLLECTION_TAGS = {
  apartments: "apartments",
  users: "users",
  landingPages: "landing-pages",
  locations: "locations",
  tags: "tags",
  translations: "translations",
  amenities: "amenities",
} as const;

export type CollectionTag = (typeof COLLECTION_TAGS)[keyof typeof COLLECTION_TAGS];

// Nguồn ngoài (không phải Payload collection) — TTL tự quản trong fetcher.
export const EXCHANGE_RATE_TAG = "exchange-rate";

// ── Per-doc tag builders (detail pages) ────────────────────────────────
// Apartment detail có thể được fetch theo slug HOẶC theo id (fallback), nên
// CMS purge cả hai biến thể; web gắn tag theo định danh nó đang dùng.
export const apartmentTag = (slugOrId: string | number) => `apartment:${slugOrId}`;
export const userTag = (agentSlug: string) => `user:${agentSlug}`;
export const landingPageByOwnerTag = (ownerId: string | number) =>
  `landing-page:owner:${ownerId}`;
