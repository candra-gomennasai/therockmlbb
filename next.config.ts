import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/teams", destination: "/" },
      { source: "/matches", destination: "/" },
      { source: "/groupstage", destination: "/" },
      { source: "/finalstage", destination: "/" },
    ];
  },
};

export default nextConfig;

