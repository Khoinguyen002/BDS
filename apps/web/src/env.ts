// Đọc env trực tiếp từ process.env, không dùng zod để giảm server bundle
// (zod nặng ~80KB gzip mà chỉ validate vài URL config — không đáng).
// NEXT_PUBLIC_* được Next inline lúc build cho client bundle.

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  // URL Payload CMS — dùng cho cả server (fetcher) lẫn client (ảnh).
  NEXT_PUBLIC_SERVER_URL:
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REVALIDATE_SECRET:
    process.env.REVALIDATE_SECRET ?? "bds-super-secret-token-2026",
  ALLOWED_IMAGE_HOSTNAMES: process.env.ALLOWED_IMAGE_HOSTNAMES,
} as const;
