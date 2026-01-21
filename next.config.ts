// Restart server trigger
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.arri.com',
      },
      {
        protocol: 'https',
        hostname: 'www.cookeoptics.com',
      },
      {
        protocol: 'https',
        hostname: 'atlaslensco.com',
      },
      {
        protocol: 'https',
        hostname: 'vantagefilm.com',
      },
    ],
  },
};

export default nextConfig;
