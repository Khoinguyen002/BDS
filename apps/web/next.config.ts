import type { NextConfig } from 'next';
import { env } from './src/env';

const payloadUrl = new URL(env.PAYLOAD_PUBLIC_SERVER_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: payloadUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: payloadUrl.hostname,
        port: payloadUrl.port || undefined,
      },
    ],
  },
};

export default nextConfig;
