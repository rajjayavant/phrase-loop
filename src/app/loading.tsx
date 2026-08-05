import { Wordmark } from "@/components/brand/wordmark";
import { Skeleton } from "@/components/ui";

/**
 * Route-level skeleton for `/`.
 *
 * The root reads searchParams and is therefore server-rendered on demand, so
 * there is a brief window before its HTML arrives. This holds the layout in
 * place during it rather than flashing an empty page.
 *
 * Moved here from the old /practice route when the player became the site
 * root; it is not part of the SEO content, which lives in the page itself.
 */
export default function HomeLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Wordmark size="sm" />
        <Skeleton className="h-8 w-32" />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-8">
        <Skeleton className="aspect-video w-full rounded-card" />
        <Skeleton className="mt-4 h-16 w-full rounded-card" />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      </main>
    </div>
  );
}
