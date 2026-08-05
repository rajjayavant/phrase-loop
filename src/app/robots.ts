import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

/**
 * Served at /robots.txt by Next's metadata route.
 *
 * Nothing is disallowed. The player now lives at the root, so blocking
 * parameterised URLs would block the homepage itself. Duplicate `?v=…&a=…`
 * variants are handled by the self-referencing canonical on `/` instead,
 * which tells crawlers every parameterised loop is the same page — the
 * correct tool for consolidating duplicates, where robots.txt would simply
 * hide the site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
