import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import d1TagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * Cache layer cho Cloudflare Workers.
 *
 * - incrementalCache: Workers KV làm durable store cho Next.js Data Cache + ISR.
 *   Bọc `withRegionalCache` → dùng CF Cache API làm lớp L1 trong-region (giảm
 *   latency/cost đọc KV). Tag revalidation vẫn luôn được check qua D1 ngay cả khi
 *   hit ở L1 (bypassTagCacheOnCacheHit mặc định = false), nên revalidate vẫn đúng.
 * - tagCache: D1 (strongly consistent) để `revalidateTag` / `revalidatePath` hoạt
 *   động ngay. (KV tag cache còn experimental + trễ ~60s nên không dùng.)
 *
 * Bindings yêu cầu trong wrangler.jsonc:
 *   - KV  : NEXT_INC_CACHE_KV
 *   - D1  : NEXT_TAG_CACHE_D1  (cần table `revalidations`, xem migrations/)
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
  tagCache: d1TagCache,
});
