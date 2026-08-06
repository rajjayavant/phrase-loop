import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // The facade poster: YouTube thumbnails, resized per viewport and
    // re-encoded by the optimizer, served same-origin so the first paint
    // needs no third-party connection.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
    // Optimized copies may be cached for a month (default is 60s, which
    // Lighthouse flags). Thumbnails for a given video id effectively never
    // change; a stale poster for up to a month is harmless.
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      {
        // The player used to live at /practice; it is now the site root.
        // Permanent (308) so search engines transfer any signals rather than
        // keeping the old URL indexed. Query strings are carried over
        // automatically, so a shared loop link still opens on its passage.
        source: "/practice",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Set here rather than in nginx so it survives server re-provisioning.
            // No `preload` until the site has run with HSTS long enough to be
            // sure — preload-list removal takes months.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
