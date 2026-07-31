import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vapvrbaevjyeepnhwsch.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // The listing moved from /bikes to /vehicles once cars and scooters joined
  // the fleet. Permanent so search engines transfer the old URL's ranking.
  async redirects() {
    return [{ source: "/bikes", destination: "/vehicles", permanent: true }];
  },
};

export default nextConfig;
