import { z } from "zod";

const envSchema = z.object({
  PAYLOAD_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REVALIDATE_SECRET: z.string().default("bds-super-secret-token-2026"),
});

export const env = envSchema.parse({
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});
