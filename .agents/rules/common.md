---
trigger: always_on
---

# Global Guidelines for BDS Platform

1. **NO HARDCODING TEXT ON FRONTEND**:
   - Tuyệt đối không hardcode văn bản (Tiếng Việt/Tiếng Anh) trực tiếp vào các component React.
   - Bắt buộc phải thêm key vào `apps/cms/scripts/seed-translations.ts`, sau đó chạy `pnpm run seed:translations` và `pnpm run sync-i18n`.
   - Sử dụng hook `useTranslations` (từ `next-intl`) ở mọi nơi.

2. **Types & Schema**:
   - Mọi thay đổi ở Backend (Payload) phải chạy `pnpm run generate:types`.
   - Mỗi khi tạo mới một Collection (Entity) trong Payload, BẮT BUỘC phải chạy `pnpm --filter cms run gen:cache-tags` để update danh sách cache tags.
   - Frontend bắt buộc import các type dùng chung từ `@bds/shared/payload-types`.

3. **Performance & UX**:
   - Sử dụng lazy loading cho các component nặng (Iframe, Map, Video 360).
   - Tối ưu Image bằng `next/image` và config `sizes` phù hợp.
