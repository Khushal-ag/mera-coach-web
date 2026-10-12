"use client";

import "@/styles/globals.css";

import { StatusPanel } from "@/components/status-panel";
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
          fonts.montserrat.variable,
          fonts.poppins.variable,
          "min-h-dvh scroll-smooth font-sans antialiased",
        )}
      >
        <StatusPanel
          fullViewport
          code="Error"
          title="Mera Coach hit a snag"
          description={
            error.message?.trim() ||
            "A critical error stopped this page from loading. Try again, or open the home page."
          }
        >
          <button type="button" onClick={reset} className="mc-btn-primary">
            Try again
          </button>
          <a href={siteConfig.links.home} className="mc-btn-secondary">
            Back to home
          </a>
        </StatusPanel>
      </body>
    </html>
  );
}
