"use client";

import * as React from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { StatusPage } from "@/features/legal/status-page";

/**
 * The app-wide error boundary: anything that throws during render below the
 * root layout lands here.
 *
 * `reset()` retries the failed segment without a full page load, which is the
 * right first move — most failures here are transient (a flaky network on the
 * way to YouTube's API), and a reload would otherwise cost the user their
 * loop.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusPage
      code="500"
      title="Something broke on our side"
      actions={
        <>
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            Back to the player
          </Link>
        </>
      }
    >
      <p>
        This one is our fault, not yours. Trying again usually works — the
        failure is often a momentary network problem.
      </p>
      <p className="text-small-body text-muted">
        If it keeps happening,{" "}
        <Link href="/contact" className="text-accent underline-offset-4 hover:underline">
          tell me about it
        </Link>
        {error.digest ? (
          <>
            {" "}
            and quote this reference:{" "}
            <code className="rounded-sm bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-primary">
              {error.digest}
            </code>
          </>
        ) : (
          "."
        )}
      </p>
    </StatusPage>
  );
}
