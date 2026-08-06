import type { MetadataRoute } from "next";
import { GUIDES } from "@/features/guides/guides";

export const BASE_URL = "https://phraseloop.online";

/**
 * Served at /sitemap.xml by Next's metadata route.
 *
 * `lastModified` is deliberately omitted: a date regenerated on every build
 * claims every page changed whenever anything did, which crawlers learn to
 * distrust. No date beats a false one.
 *
 * Only the bare `/` is listed. Parameterised variants (`/?v=…&a=…`) are the
 * same page with a different video loaded, and the self-referencing canonical
 * on `/` already points them here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/guides`, changeFrequency: "monthly", priority: 0.8 },
    // Generated from the guide registry, so a guide cannot be published
    // without being submitted.
    ...GUIDES.map((guide) => ({
      url: `${BASE_URL}/guides/${guide.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    { url: `${BASE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
    {
      url: `${BASE_URL}/author/raj-jayavant`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    { url: `${BASE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
