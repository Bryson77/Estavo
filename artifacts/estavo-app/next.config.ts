import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["*"],
  basePath: "/app",
};

export default nextConfig;
