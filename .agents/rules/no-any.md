# Strict TypeScript: NO `any` ALLOWED

> Đây là luật cứng từ USER để đảm bảo chất lượng code và tránh các lỗi ẩn tiềm tàng. Bắt buộc Agent phải tuân thủ trong MỌI trường hợp sửa code hoặc viết mới TypeScript.

## 1. TUYỆT ĐỐI KHÔNG DÙNG `any`
- Không sử dụng `as any` để ép kiểu.
- Không định nghĩa `type` hoặc `interface` có chứa `any` (vd: `Record<string, any>`, `[key: string]: any`).
- Không khai báo tham số function là `any`.
- Không sử dụng `any` trong Generic Types (vd: `Promise<any>`).

## 2. CÁC LỰA CHỌN THAY THẾ (Type-Safe Alternatives)
1. **Dùng `unknown`:** Khi bạn không biết chắc kiểu dữ liệu trả về từ API hoặc thư viện bên thứ 3.
2. **Dùng `Partial<T>` hoặc `Omit<T, K>`:** Khi bạn cần một bản sao lỏng lẻo hơn của một type có sẵn.
3. **Dùng `Record<string, unknown>`:** Khi bạn cần định nghĩa một object linh hoạt mà chưa rõ keys.
4. **Viết Type/Interface cụ thể:** Luôn chủ động xem file định nghĩa (vd: `payload-types.ts`) hoặc tự định nghĩa type/interface mô tả đúng cấu trúc dữ liệu cần thiết.
5. **Dùng type assertion hẹp (narrow casting):** `as "ltr"`, `as const`, hoặc `as MySpecificType` thay vì `as any`.

## 3. NGOẠI LỆ
- KHÔNG CÓ NGOẠI LỆ NÀO. Nếu type mismatch, phải đào sâu sửa cho đúng type thay vì dùng `any` để bypass compiler. Nếu TS compiler la lỗi, TÌM HIỂU VÀ SỬA.
