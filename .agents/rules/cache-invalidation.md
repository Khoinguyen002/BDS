

# Cache Invalidation Rules

## Fetching Data (Web App)

1. **`autoCacheFetch` CHỈ gọi Payload built-in REST API** (`/api/{collection-slug}`).
   - Collection tag tự derive từ endpoint — **KHÔNG truyền tag thủ công**.
   - Custom endpoint → dùng `fetch()` thường, **KHÔNG cache**.

2. **Không import `fetchAPI`** — đã deprecated, bị ESLint chặn.

3. **Không import per-doc tag builders** (`apartmentTag`, `userTag`, `landingPageByOwnerTag`) — đã loại bỏ.

## CMS Hooks (Collection Invalidation)

4. **Mỗi collection có cache trên web BẮT BUỘC có cả `afterChange` + `afterDelete` hook** gọi revalidate.
   - Collection bị reference bởi collection khác → dùng `triggerRevalidateWithCascade`
   - Collection "leaf" (không bị reference) → dùng `triggerRevalidateTag`

5. **Collections excluded khỏi cache**: `media`, `leads`, `templates`
   - media: URL bất biến (CDN-backed), thay ảnh = upload mới
   - leads: không hiển thị trên public web
   - templates: chỉ dùng create-time trong CMS

## Khi Thêm/Sửa Collection

6. **Khi thêm collection mới hoặc relationship field mới**:
   - Chạy `pnpm --filter cms run gen:cache-tags`
   - Verify output `packages/shared/cache-tags.ts` có đúng COLLECTION_TAGS và REVERSE_DEPS
   - Thêm `afterChange` + `afterDelete` hook cho collection mới
   - Chọn `triggerRevalidateWithCascade` nếu collection bị reference bởi collection khác

7. **KHÔNG sửa `packages/shared/cache-tags.ts` thủ công** — file này auto-generated.
