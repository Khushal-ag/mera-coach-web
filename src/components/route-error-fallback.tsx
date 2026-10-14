"use client";

import { useEffect } from "react";

export function RouteErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-xl py-8 sm:py-12">
      <h1 className="font-display text-[22px] leading-tight font-bold text-ink">
        Something went wrong
      </h1>
      <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-ink-muted">
        This page could not be loaded. Try again, or go back home.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="mc-btn-primary w-full sm:w-auto"
        >
          Try again
        </button>
        <a href="/" className="mc-btn-secondary w-full sm:w-auto">
          Back to home
        </a>
      </div>
    </div>
  );
}
