import type { MetadataRoute } from "next";

export const BASE_URL = "https://phraseloop.online";

/**
 * Served at /sitemap.xml by Next's metadata route.
 *
 * `lastModified` is deliberately omitted: a date regenerated on every build
 * claims every page changed whenever anything did, which crawlers learn to
 * distrust. No date beats a false one.
 *
 * `/practice` is excluded — it is a parameterised view of user-supplied
 * videos, not a page with content of its own worth indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
