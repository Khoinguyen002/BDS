import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["cms.dounus.id.vn", "pc-3000.dounus.id.vn"],
};

export default withPayload(nextConfig);
