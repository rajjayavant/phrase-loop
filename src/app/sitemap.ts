import type { MetadataRoute } from "next";
import { GUIDES, UPDATED } from "@/features/guides/guides";

export const BASE_URL = "https://phraseloop.online";

/**
 * Served at /sitemap.xml by Next's metadata route.
 *
 * `changeFrequency` and `priority` are deliberately absent: Google states it
 * ignores both. `lastModified` is the one field it does use, and only while it
 * stays truthful, so the dates here are declared constants rather than build
 * timestamps. A date that moves on every deploy claims every page changed
 * whenever anything did, and crawlers learn to distrust it.
 *
 * Update `SITE_UPDATED` when the homepage or legal pages change, and `UPDATED`
 * in the guide registry when a guide's text changes.
 */
const SITE_UPDATED = "2026-08-06";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, lastModified: SITE_UPDATED },
    { url: `${BASE_URL}/guides`, lastModified: UPDATED },
    ...GUIDES.map((guide) => ({
      url: `${BASE_URL}/guides/${guide.slug}`,
      lastModified: UPDATED,
    })),
    { url: `${BASE_URL}/about`, lastModified: SITE_UPDATED },
    { url: `${BASE_URL}/author/raj-jayavant`, lastModified: SITE_UPDATED },
    { url: `${BASE_URL}/contact`, lastModified: SITE_UPDATED },
    { url: `${BASE_URL}/privacy`, lastModified: SITE_UPDATED },
    { url: `${BASE_URL}/terms`, lastModified: SITE_UPDATED },
  ];
}
