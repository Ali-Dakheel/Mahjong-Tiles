import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Required for Docker — copies only what's needed into .next/standalone
  output: 'standalone',
};

export default nextConfig;
