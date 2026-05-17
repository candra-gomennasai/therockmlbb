import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [
      { source: "/teams", destination: "/" },
      { source: "/matches", destination: "/" },
      { source: "/groupstage", destination: "/" },
      { source: "/finalstage", destination: "/" },
      { source: "/champion", destination: "/?tab=champion" },
    ];
  },
};

export default nextConfig;

