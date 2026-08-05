import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

/**
 * Served at /robots.txt by Next's metadata route.
 *
 * `/practice` is disallowed on purpose. Every shared loop is a distinct URL
 * over the same view (`?v=…&a=…&b=…`), so leaving it open would let crawlers
 * index unbounded near-duplicate pages of other people's videos — bad for our
 * own ranking and not content we should be publishing. Real pages stay open.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/practice"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
