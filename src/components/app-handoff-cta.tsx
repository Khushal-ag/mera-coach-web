"use client";

import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";

type AppHandoffCtaProps = {
  /** `meracoach://…` URL: must match the native app scheme. */
  href: string;
  /** Soft auto-open delay; `0` disables auto-redirect. */
  autoRedirectMs?: number;
  /** Supporting copy under the button. */
  hint?: string;
  className?: string;
};

/**
 * CTA that opens the native app via custom scheme. Optional gentle auto-redirect
 * (not immediate) so users can still read the success message.
 */
export function AppHandoffCta({
  href,
  autoRedirectMs = 2800,
  hint,
  className,
}: AppHandoffCtaProps) {
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (autoRedirectMs <= 0) return;
    const timer = window.setTimeout(() => {
      setAttempted(true);
      window.location.assign(href);
    }, autoRedirectMs);
    return () => window.clearTimeout(timer);
  }, [href, autoRedirectMs]);

  return (
    <div
      className={
        className ?? "rounded-2xl border border-line bg-surface/80 p-4 sm:p-5"
      }
    >
      <a href={href} className="mc-btn-primary inline-flex w-full sm:w-auto">
        {siteConfig.app.handoffLabel}
      </a>
      {hint ?
        <p className="mt-3 text-sm text-ink-muted">{hint}</p>
      : null}
      {autoRedirectMs > 0 ?
        <p className="mt-2 text-xs text-ink-muted">
          {attempted ?
            "If the app did not open, tap the button above."
          : "Opening the app in a moment…"}
        </p>
      : null}
    </div>
  );
}
