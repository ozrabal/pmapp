import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.env.TURBOPACK_ROOT || undefined,
  },
  excludeFiles: ["/astro-app/**"],
};

export default nextConfig;
