import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every route except `/` is prerendered at build time and nothing revalidates,
// so the prerendered pages are served read-only from Workers static assets.
// Switch to the R2 cache if a route ever needs ISR or on-demand revalidation.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
