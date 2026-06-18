---
trigger: always_on
---

# BDS Design Concept & Visual Language

> Tài liệu này là luật cứng cho toàn bộ giao diện BDS Platform.
> Agent PHẢI đọc và tuân thủ trước khi chạm vào bất kỳ file CSS, component, hay layout nào.
> Khi có xung đột với skill `design-taste-frontend`, rule này ưu tiên hơn.

---

## 1. DESIGN READ (Cố Định - Không Suy Đoán)

**"Reading this as: Vietnamese real-estate marketplace for buyers/renters/agents, with a trust-first neutral language, leaning toward sharp geometry + muted palette + generous spacing."**

### Dial Configuration (Override mặc định của design skill)

| Dial | Value | Lý do |
|---|---|---|
| `DESIGN_VARIANCE` | 4 | Bố cục rõ ràng, dễ scan. Không cần asymmetric fancy. |
| `MOTION_INTENSITY` | 4 | Micro-interaction nhẹ nhàng (hover, scroll-reveal). Không cinematic. |
| `VISUAL_DENSITY` | 4 | Thoáng, không chật. Nhưng không art-gallery trống trơn. |

---

## 2. GÓC CẠNH (The #1 Rule - Zero Radius)

**Tuyệt đối KHÔNG bo góc.** Đây là quyết định thẩm mỹ cốt lõi, không phải suggestion.

### Luật cứng
- `border-radius: 0` trên MỌI element: card, button, input, modal, dropdown, tag, badge, avatar, image container.
- CSS variable `--theme-radius: 0px` đã được set trong `globals.css`. KHÔNG override.
- Class `rounded-*` (rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full) **BỊ CẤM** trên mọi component.
- Ngoại lệ DUY NHẤT: `rounded-full` cho avatar hình tròn của user/agent (vì avatar tròn là convention UX phổ quát). Ngoài ra KHÔNG CÓ ngoại lệ nào khác.

### Kiểm tra trước khi ship
- Grep toàn bộ `apps/web/src` cho `rounded-` (trừ `rounded-full` trên avatar). Nếu tìm thấy → sửa về `rounded-none` hoặc xoá class.

---

## 3. MÀU SẮC (Neutral, Muted, Intentional)

### Palette gốc
- **Background:** Pure white `#ffffff` (light) / Near-black `#09090b` (dark)
- **Surface/Subtle:** Zinc-100 `#f4f4f5` (light) / Zinc-900 `#18181b` (dark)
- **Text Primary:** Zinc-950 `#09090b` (light) / Zinc-50 `#fafafa` (dark)
- **Text Secondary:** Zinc-600 `#52525b` (light) / Zinc-400 `#a1a1aa` (dark)
- **Text Muted:** Zinc-500 `#71717a` (cả 2 mode)
- **Border:** Zinc-200 `#e4e4e7` (light) / Zinc-800 `#27272a` (dark)
- **Accent (Primary):** Emerald-600 `#059669` - Mặc định, có thể override bởi agent theme

### Luật cứng
- **Tối đa 1 accent color** trên toàn trang. Không có màu phụ thứ 2.
- **Saturation < 70%.** Không neon, không electric blue, không hot pink.
- **Không gradient trên text.** Không gradient trên button. Gradient chỉ được dùng làm subtle background overlay (opacity < 10%).
- **Không shadow đậm.** Nếu dùng shadow → tint theo background hue, opacity thấp. Không `shadow-xl` hay `shadow-2xl` trên card.
- **Warm grey bị cấm.** Palette là cool-neutral (Zinc family). Không Stone, không Amber background, không beige.

### Status colors (ngoại lệ cho semantic)
- Success: Emerald (đã là accent)
- Error: Rose-500 `#f43f5e`
- Warning: Amber-500 `#f59e0b`
- Info: Sky-500 `#0ea5e9`
- Chỉ dùng cho badge, toast, form validation. KHÔNG dùng làm decoration.

---

## 4. BỐ CỤC (Clean, Spacious, Scannable)

### Spacing
- Section gap: `py-20` đến `py-28` (80px-112px). Không chật hơn `py-16`, không thưa quá `py-32`.
- Content max-width: `max-w-7xl` (1280px). Không rộng hơn.
- Content padding: `px-4` mobile, `px-6` tablet, `px-8` desktop.
- Card/element gap trong grid: `gap-6` mặc định. Có thể `gap-8` cho feature sections.

### Grid
- Dùng CSS Grid (`grid grid-cols-*`). KHÔNG dùng flexbox percentage math.
- Grid phổ biến: 1 col mobile → 2 col tablet → 3 col desktop (cho listings). 
- 1 col mobile → 2 col desktop (cho feature sections, split content).
- KHÔNG dùng grid 4+ col cho content (trừ logo wall hoặc stats row nhỏ).

### Hierarchy
- Mỗi section có MỘT focal point rõ ràng (heading + 1 visual/CTA).
- Heading → Subtext → Content/Grid → CTA. Thứ tự này KHÔNG đảo.
- KHÔNG nhồi quá 3 level thông tin vào 1 section.

### Anti-patterns
- KHÔNG center-align mọi thứ. Text body luôn `text-left`. Heading có thể center cho hero, nhưng section heading nên left-align.
- KHÔNG dùng nhiều hơn 2 CTA buttons trong 1 viewport.
- KHÔNG đặt text trên image không có overlay/scrim (contrast fail).

---

## 5. TYPOGRAPHY

### Font Stack
- **Sans:** Geist Sans (đã config trong Next.js) → fallback system sans-serif.
- **Mono:** Geist Mono → fallback system monospace. Dùng cho số liệu, giá, mã.
- **KHÔNG dùng serif.** Không ngoại lệ. BDS là platform trust-first, không phải editorial/luxury magazine.

### Scale
- Hero H1: `text-3xl md:text-5xl` - Không to hơn. Đủ impact mà không la hét.
- Section H2: `text-2xl md:text-3xl`
- Card H3: `text-lg`
- Body: `text-base` (`16px`), `leading-relaxed`
- Small/Caption: `text-sm`, `text-foreground-muted`
- **Letter-spacing:** Headings: `tracking-tight` (-0.025em). Body: default. KHÔNG dùng `tracking-widest` cho uppercase eyebrows.

### Luật cứng
- KHÔNG dùng `text-6xl` trở lên. Quá to cho context bất động sản Việt Nam.
- KHÔNG dùng ALL CAPS cho body text hoặc paragraph. Chỉ cho label nhỏ (tab, badge status).
- Số tiền/diện tích luôn dùng `font-mono` và `tabular-nums`.

---

## 6. MOTION & INTERACTION

### Cho phép
- **Hover states:** `transition-colors`, `transition-all` trên button, link, card. Duration `150ms-300ms`.
- **Scroll reveal:** `whileInView` với Motion, `opacity: 0 → 1`, `y: 16 → 0`. Duration `0.4s-0.6s`. `viewport={{ once: true }}`.
- **Tactile feedback:** Button `:active` → `scale-[0.98]` hoặc `-translate-y-px`.
- **Page transitions:** Fade đơn giản giữa các route. Không slide, không morph.

### BỊ CẤM
- KHÔNG parallax effect.
- KHÔNG scroll-hijack (horizontal pan, sticky stack kiểu cinematic).
- KHÔNG infinite loop animation (marquee, shimmer vô hạn, floating elements).
- KHÔNG particle effects, mesh gradient animation, magnetic cursor.
- KHÔNG GSAP ScrollTrigger (overkill cho use-case này).
- KHÔNG glassmorphism / frosted glass. 
- KHÔNG `backdrop-blur` trên card hay overlay (trừ mobile nav overlay nếu cần).

### Lý do
Người dùng BDS đang tìm nhà/đầu tư. Họ cần scan thông tin nhanh, không cần "wow effect". Motion phải invisible - hỗ trợ UX chứ không phải showoff.

---

## 7. COMPONENT PATTERNS

### Card (Property Listing)
- Border `1px solid var(--border)`. Không shadow.
- Góc vuông (radius 0). 
- Image container: `aspect-[4/3]`, `overflow-hidden`.
- Hover: `border-color` chuyển sang `var(--theme-primary)` opacity 30%. Không lift (`-translate-y`), không shadow on hover.
- Content padding: `p-4` hoặc `p-5`.

### Button
- Primary: `bg-primary text-white`. Góc vuông. `px-6 py-3`. `font-medium`.
- Secondary: `border border-border text-foreground`. Góc vuông. 
- Ghost: `text-primary hover:bg-primary/5`. Không border.
- KHÔNG pill button (rounded-full). KHÔNG gradient button. KHÔNG glow effect.

### Input / Form
- `border border-border`. Góc vuông. `px-4 py-3`.
- Focus: `border-primary ring-1 ring-primary`.
- Label TRÊN input. Helper text dưới. Error text dưới input (màu Rose).
- KHÔNG placeholder-as-label.

### Navigation
- Height: `64px` max. Không to hơn.
- Simple horizontal links. Logo trái, nav giữa/phải.
- Mobile: hamburger → full-screen overlay hoặc slide-in panel.
- Active state: `text-primary` hoặc `border-b-2 border-primary`. Không background highlight.

---

## 8. IMAGE & VISUAL ASSETS

- Dùng `next/image` bắt buộc. Config `sizes` prop phù hợp.
- Lazy load mọi image ngoài viewport đầu tiên.
- Hero image: `priority={true}`.
- Fallback: Unsplash URLs thật (không picsum random). Phải match context bất động sản.
- KHÔNG dùng SVG illustration tự vẽ thay cho ảnh thật.
- KHÔNG dùng div-based fake screenshot.
- Avatar agent: Ảnh thật hoặc placeholder có chữ cái đầu tên. KHÔNG egg icon.

---

## 9. DARK MODE

- Hỗ trợ cả 2 mode. Detect `prefers-color-scheme` làm default.
- Token đã define trong `globals.css`. KHÔNG define thêm biến mới ngoài hệ thống hiện tại.
- KHÔNG dùng pure `#000000` background (dùng zinc-950 `#09090b`).
- KHÔNG dùng pure `#ffffff` text trên dark (dùng zinc-50 `#fafafa`).
- Test cả 2 mode trước khi ship. Contrast WCAG AA minimum.

---

## 10. AGENT-SPECIFIC NOTES (Quan điểm bổ sung)

### Consistency over Creativity
- Một trang web bất động sản cần **tin cậy hơn là ấn tượng**. User đang bỏ tiền tỷ, họ muốn thấy sự chuyên nghiệp, không phải Awwwards entry.
- Nếu phân vân giữa "đẹp lạ" và "quen mắt dễ dùng" → luôn chọn cái sau.

### Information Architecture > Visual Flourish
- Thông tin BĐS rất nặng (giá, pháp lý, hướng, tầng, diện tích...). Layout phải phục vụ việc scan data, không phải trưng bày.
- Mỗi data point cần visual hierarchy rõ: label nhỏ mờ → value to đậm. Không nhồi mọi thứ cùng font-size.

### Mobile-First Reality
- 70%+ traffic BĐS Việt Nam là mobile. Mọi component PHẢI test mobile trước.
- Touch target tối thiểu `44px`. 
- Không hover-dependent interaction trên mobile (luôn có fallback tap).

### Performance Budget
- Trang listing load < 2s trên 4G. 
- Lazy load tất cả component nặng: Map iframe, Video 360, Gallery carousel.
- Bundle size awareness: không import toàn bộ icon library, chỉ import cái cần.

### Văn hoá hiển thị giá BĐS Việt Nam
- Giá luôn format `Intl.NumberFormat("vi-VN")` với `currency: "VND"`.
- Không rút gọn (ví dụ "1.2 tỷ") trừ khi có tooltip/expand để show số đầy đủ.
- Giá/m² là thông tin bắt buộc bên cạnh tổng giá.
- Nếu giá thoả thuận → show text rõ ràng, KHÔNG để trống.
