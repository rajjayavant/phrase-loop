import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { StatusPage } from "@/features/legal/status-page";

export const metadata: Metadata = {
  title: "Page not found — PhraseLoop",
  // Keep dead URLs out of the index; there is nothing here worth ranking.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="This page doesn't exist"
      actions={
        <>
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            Start practising
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "secondary" })}>
            About PhraseLoop
          </Link>
        </>
      }
    >
      <p>
        The link may be mistyped, or the page may have moved. Nothing is broken
        on your end.
      </p>
      <p className="text-small-body text-muted">
        If you were opening a practice link someone shared, ask them to send it
        again — a link can get clipped when it travels through chat apps.
      </p>
    </StatusPage>
  );
}
