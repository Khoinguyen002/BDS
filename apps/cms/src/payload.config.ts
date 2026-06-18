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
import { env } from "./env";

export default buildConfig({
  i18n: {
    supportedLanguages: { vi, en },
  },
  localization: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    fallback: true,
  },
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
    },
    push: true,
  }),
  editor: lexicalEditor({}),
  cors: [env.NEXT_PUBLIC_APP_URL],
  csrf: [env.NEXT_PUBLIC_APP_URL],
  cookiePrefix: "payload",
  typescript: {
    outputFile: path.resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../../packages/shared/payload-types.ts",
    ),
  },
  secret: env.PAYLOAD_SECRET,
  collections: [Users, LandingPages, Media, Apartments, Leads, Templates],
  plugins: [
    ...(env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: env.S3_SECRET_ACCESS_KEY || "",
              },
              region: env.S3_REGION,
              endpoint: env.S3_ENDPOINT || "",
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
