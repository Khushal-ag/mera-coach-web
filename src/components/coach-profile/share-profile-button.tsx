"use client";

import { useState } from "react";

import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type ShareProfileButtonProps = {
  coachName: string;
  /** Public profile URL. Defaults to the current page without a hash. */
  url?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  variant?:
    "primary" | "outline-on-dark" | "secondary" | "quiet" | "quiet-on-dark";
};

export function ShareProfileButton({
  coachName,
  url: urlProp,
  className,
  label = "Share profile",
  disabled,
  variant = "outline-on-dark",
}: ShareProfileButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function shareProfile() {
    if (disabled) return;
    const url =
      urlProp?.trim() ||
      (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");
    if (!url) return;

    const title = `${coachName} on Mera Coach`;
    const text = `Check out ${coachName}'s coaching profile on Mera Coach.`;

    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function"
      ) {
        await navigator.share({ title, text, url });
        setFeedback("Shared");
        window.setTimeout(() => setFeedback(null), 2000);
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    const copied = await copyText(url);
    setFeedback(copied ? "Link copied" : "Could not copy link");
    window.setTimeout(() => setFeedback(null), 2500);
  }

  const quiet = variant === "quiet" || variant === "quiet-on-dark";
  const variantClass =
    variant === "primary" ? "mc-btn-primary"
    : variant === "secondary" ? "mc-btn-secondary"
    : variant === "quiet" ?
      "inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-mc-secondary underline-offset-4 hover:underline"
    : variant === "quiet-on-dark" ?
      "inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-white/75 underline-offset-4 hover:text-white hover:underline"
    : "mc-btn-outline-on-dark";

  return (
    <button
      type="button"
      onClick={() => void shareProfile()}
      disabled={disabled}
      className={cn(variantClass, !quiet && "min-h-11 px-4 text-sm", className)}
      aria-live="polite"
    >
      {quiet && !feedback ?
        <i className="fas fa-share-alt" style={{ fontSize: 16 }} aria-hidden />
      : null}
      {feedback ?? label}
    </button>
  );
}
