"use client";

import "@/styles/globals.css";

import { BrandLockup } from "@/components/brand-lockup";
import { RouteErrorFallback } from "@/components/route-error-fallback";
import { siteConfig } from "@/config/site";
import * as fonts from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Root-level recovery UI. Must define its own html/body because the root
 * layout may have crashed and cannot wrap this tree.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          fonts.nunito.variable,
          fonts.poppins.variable,
          "min-h-dvh scroll-smooth bg-paper font-sans text-ink antialiased",
        )}
      >
        <header className="sticky top-0 z-50 border-b border-line bg-[color:var(--paper)] shadow-[0_1px_20px_rgba(44,24,16,0.08)]">
          <div className="container flex h-[4.5rem] items-center">
            <a
              href={siteConfig.links.home}
              className="flex min-h-11 min-w-0 items-center"
              aria-label={siteConfig.name}
            >
              <BrandLockup variant="workspace" />
            </a>
          </div>
        </header>
        <main>
          <div className="container">
            <RouteErrorFallback error={error} reset={reset} />
          </div>
        </main>
      </body>
    </html>
  );
}
