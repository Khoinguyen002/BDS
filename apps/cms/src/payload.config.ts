import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { Users } from './collections/Users';
import { LandingPages } from './collections/LandingPages';
import { Media } from './collections/Media';
import { Apartments } from './collections/Apartments';
import { Leads } from './collections/Leads';
import { registerHandler } from './endpoints/register';

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || 'postgres://postgres:postgres@127.0.0.1:5432/bds',
    },
  }),
  editor: lexicalEditor({}),
  cors: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  cookiePrefix: 'payload',
  typescript: {
    outputFile: './src/payload-types.ts',
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN || '.local.tenmiencua.com',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  secret: process.env.PAYLOAD_SECRET || 'supersecret',
  collections: [Users, LandingPages, Media, Apartments, Leads],
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true,
      },
    }),
  ],
  endpoints: [
    {
      path: '/users/register',
      method: 'post',
      handler: registerHandler,
    },
  ],
});
