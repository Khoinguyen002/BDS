"use server";

import { SERVER_URL } from "@/lib/payload-fetcher";
import { revalidateTag } from "next/cache";

export async function submitLead(formData: FormData) {
  try {
    const data = {
      name: formData.get("name")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      type: formData.get("type")?.toString() || "sale",
      message: formData.get("message")?.toString() || "",
      owner: formData.get("ownerId")?.toString() || undefined, // undefined if from platform homepage
      cfTurnstileResponse: formData.get("cfTurnstileResponse")?.toString() || "",
    };

    if (!data.name || !data.phone) {
      return { error: "Vui lòng nhập tên và số điện thoại." };
    }
    
    if (!data.cfTurnstileResponse) {
      return { error: "Vui lòng xác thực CAPTCHA." };
    }

    const internalApiKey = process.env.INTERNAL_API_KEY;
    if (!internalApiKey) {
      console.warn("INTERNAL_API_KEY is not set in web environment.");
    }

    const response = await fetch(`${SERVER_URL}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-api-key": internalApiKey || "",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      // If it's a dedupe warning or something specific, handle it
      if (err.errors && err.errors.length > 0) {
        return { error: err.errors[0].message || "Lỗi khi gửi thông tin." };
      }
      return { error: err.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." };
    }

    return { success: true };
  } catch (error) {
    console.error("Submit lead error:", error);
    return { error: "Lỗi kết nối máy chủ." };
  }
}
