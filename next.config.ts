import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.coolblue.nl",
      },
    ],
  },
};

export default nextConfig;
