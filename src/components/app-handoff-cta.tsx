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
  /** Additional tip for refreshing or accessing the app. */
  refreshTip?: string;
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
  refreshTip,
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
        className ??
        "rounded-2xl border border-line bg-surface/80 p-5 text-center sm:p-6"
      }
    >
      <a
        href={href}
        className="mc-btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        <i className="fas fa-mobile-alt" aria-hidden="true" />
        {siteConfig.app.handoffLabel}
      </a>
      {hint ?
        <p className="mt-3 text-sm leading-relaxed font-medium text-ink-muted">
          {hint}
        </p>
      : null}
      {refreshTip ?
        <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-line/60 bg-paper-elevated px-3 py-2 text-left text-xs text-ink-muted">
          <i
            className="fas fa-info-circle shrink-0 text-mc-secondary"
            aria-hidden="true"
          />
          <span>{refreshTip}</span>
        </div>
      : null}
      {autoRedirectMs > 0 ?
        <p className="mt-3 text-xs text-ink-muted">
          {attempted ?
            "Tap the button above anytime to open the app directly."
          : "Opening the app in a moment…"}
        </p>
      : null}
    </div>
  );
}
