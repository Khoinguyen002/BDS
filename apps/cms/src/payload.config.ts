import { buildConfig } from "payload";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { vi } from "@payloadcms/translations/languages/vi";
import { en } from "@payloadcms/translations/languages/en";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { Users } from "./collections/Users";
import { LandingPages } from "./collections/LandingPages";
import { Media } from "./collections/Media";
import { Apartments } from "./collections/Apartments";
import { Leads } from "./collections/Leads";
import { Templates } from "./collections/Templates";
import { registerHandler } from "./endpoints/register";

export default buildConfig({
  i18n: {
    supportedLanguages: { vi, en },
  },
  localization: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    fallback: true,
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3001",
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ||
        "postgres://postgres:postgres@127.0.0.1:5432/bds",
    },
    push: true,
  }),
  editor: lexicalEditor({}),
  cors: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  csrf: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  cookiePrefix: "payload",
  typescript: {
    outputFile: path.resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../../packages/shared/payload-types.ts",
    ),
  },
  secret: process.env.PAYLOAD_SECRET || "supersecret",
  collections: [Users, LandingPages, Media, Apartments, Leads, Templates],
  plugins: [
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
              },
              region: process.env.S3_REGION || "auto",
              endpoint: process.env.S3_ENDPOINT || "",
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
  endpoints: [
    {
      path: "/users/register",
      method: "post",
      handler: registerHandler,
    },
  ],
});
