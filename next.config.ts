import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.env.TURBOPACK_ROOT || undefined,
  },
};

export default nextConfig;
