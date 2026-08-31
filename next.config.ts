import type { NextConfig } from "next";
import { securityHeaders } from "@/lib/security-headers";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    SERVER_URL: process.env.SERVER_URL,
    CLIENT_URL: process.env.CLIENT_URL,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
