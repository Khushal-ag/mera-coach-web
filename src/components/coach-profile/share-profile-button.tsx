"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ShareProfileButtonProps = {
  coachName: string;
  className?: string;
  label?: string;
  variant?: "primary" | "outline-on-dark" | "secondary" | "ghost-on-dark";
};

async function copyProfileUrl(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // fall through to execCommand
  }
  try {
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  } catch {
    return false;
  }
}

export function ShareProfileButton({
  coachName,
  className,
  label = "Share profile",
  variant = "outline-on-dark",
}: ShareProfileButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function shareProfile() {
    const url =
      typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
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

    const copied = await copyProfileUrl(url);
    setFeedback(copied ? "Link copied" : "Could not copy link");
    window.setTimeout(() => setFeedback(null), 2500);
  }

  const variantClass =
    variant === "primary" ? "mc-btn-primary"
    : variant === "secondary" ? "mc-btn-secondary"
    : variant === "ghost-on-dark" ?
      "inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 font-semibold text-white backdrop-blur-sm transition hover:bg-white/18"
    : "mc-btn-outline-on-dark";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void shareProfile()}
        className={cn(variantClass, "min-h-12 px-7 text-sm", className)}
        aria-live="polite"
      >
        {feedback ?? label}
      </button>
    </div>
  );
}
