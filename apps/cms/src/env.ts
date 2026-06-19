import { z } from "zod";

const envSchema = z.object({
  DATABASE_URI: z
    .string()
    .url()
    .default("postgres://postgres:postgres@127.0.0.1:5432/bds"),
  PAYLOAD_SECRET: z.string().default("supersecret_bds_2026"),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ENDPOINT: z.string().optional(),
  REVALIDATE_SECRET: z.string().default("bds-super-secret-token-2026"),
});

export const env = envSchema.parse({
  DATABASE_URI: process.env.DATABASE_URI,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET,
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_REGION: process.env.S3_REGION,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
});
