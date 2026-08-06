import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
