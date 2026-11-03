"use client";

import { AlertBanner } from "@/components/ui/alert-banner";
import { friendlyPdfError } from "@/lib/api/pdf";
import { cn } from "@/lib/utils";

/** Inline notice after a failed PDF download (host limit vs real error). */
export function PdfDownloadAlert({
  message,
  onDismiss,
  className,
}: {
  message: string;
  onDismiss: () => void;
  className?: string;
}) {
  const { tone, text } = friendlyPdfError(message);
  return (
    <AlertBanner
      tone={tone}
      className={cn(
        "print:hidden",
        "flex items-start justify-between gap-3 text-left",
        className,
      )}
    >
      <p className="min-w-0 flex-1 text-sm leading-relaxed">{text}</p>
      <button
        type="button"
        className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold opacity-80 hover:opacity-100"
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <i className="fas fa-times" aria-hidden />
      </button>
    </AlertBanner>
  );
}
