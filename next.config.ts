import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Runner-Registrations',
  assetPrefix: '/Runner-Registrations/',
  trailingSlash: true,
};

export default nextConfig;
