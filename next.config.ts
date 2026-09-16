import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this app so it doesn't pick up a parent lockfile.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
