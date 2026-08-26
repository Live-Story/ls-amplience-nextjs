import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ls-client-sdk"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
