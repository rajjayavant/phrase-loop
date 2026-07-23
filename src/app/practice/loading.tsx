import { Wordmark } from "@/components/brand/wordmark";
import { Skeleton } from "@/components/ui";

export default function PracticeLoading() {
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
