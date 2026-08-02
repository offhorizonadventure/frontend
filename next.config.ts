import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone: a self-contained server with only the modules it
  // actually imports. Lets the Docker image ship without node_modules, which
  // takes it from ~1.5GB to ~200MB.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vapvrbaevjyeepnhwsch.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Don't advertise the framework. Free, and one less hint for anyone
  // scanning for known Next.js issues.
  poweredByHeader: false,

  // Nginx in front of this already gzips responses; doing it twice burns CPU
  // on every request for nothing.
  compress: false,

  // Source maps would ship the readable server and client source to anyone
  // who asks. Off by default, but stated so nobody turns it on by accident.
  productionBrowserSourceMaps: false,

  compiler: {
    // Strip stray console.log from the client bundle, but keep error and warn
    // — the payment and cart paths use console.error to report real failures.
    removeConsole: { exclude: ["error", "warn"] },
  },

  experimental: {
    // lucide-react is a barrel file re-exporting ~1500 icons. Without this,
    // importing three icons can pull the whole module into the graph. This
    // rewrites them to direct per-icon imports.
    optimizePackageImports: ["lucide-react"],
  },

  // The listing moved from /bikes to /vehicles once cars and scooters joined
  // the fleet. Permanent so search engines transfer the old URL's ranking.
  async redirects() {
    return [{ source: "/bikes", destination: "/vehicles", permanent: true }];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Set here as well as at the proxy: if the app is ever moved behind
          // a different front end, the protections travel with it.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Nothing here needs a camera, mic or location.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      // No Cache-Control rule for /_next/static here on purpose: Next already
      // serves those immutable, and overriding it breaks asset reloading in
      // development.
    ];
  },
};

export default nextConfig;
