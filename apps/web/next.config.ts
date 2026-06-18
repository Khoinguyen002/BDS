import type { NextConfig } from 'next';
import { env } from './src/env';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const payloadUrl = new URL(env.PAYLOAD_PUBLIC_SERVER_URL);

const allowedHostnames = env.ALLOWED_IMAGE_HOSTNAMES
  ? env.ALLOWED_IMAGE_HOSTNAMES.split(',').map(h => h.trim()).filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: payloadUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: payloadUrl.hostname,
        port: payloadUrl.port || undefined,
      },
      ...allowedHostnames.map(hostname => ({
        protocol: 'https' as const,
        hostname,
      })),
    ],
  },
};

export default withNextIntl(nextConfig);
