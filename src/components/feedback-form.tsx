"use client";

import { useState } from "react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField } from "@/components/ui/field";
import { firstApiError, isApiSuccess, submitFeedback } from "@/lib/api";

export function FeedbackForm({
  coachCode,
  clientCode,
  coachName,
  clientName,
}: {
  coachCode: string;
  clientCode: string;
  coachName?: string;
  clientName?: string;
}) {
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!coachCode || !clientCode) {
    return (
      <AlertBanner tone="error">
        Open this page with <code>coachCode</code> and <code>clientCode</code>{" "}
        query parameters from your coach&apos;s feedback link.
      </AlertBanner>
    );
  }

  async function onSubmit(formData: FormData) {
    if (status === "success") return;
    setStatus("loading");
    setMessage(null);
    try {
      const response = await submitFeedback({
        coachCode,
        clientCode,
        rating,
        comments: String(formData.get("comments") ?? "").trim() || undefined,
        clientName: clientName || undefined,
      });
      if (!isApiSuccess(response)) {
        setStatus("error");
        setMessage(firstApiError(response) ?? "Could not submit feedback.");
        return;
      }
      setStatus("success");
      setMessage("Thanks for your feedback!");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not submit feedback.",
      );
    }
  }

  const locked = status === "success";
  const busy = status === "loading";

  return (
    <form action={onSubmit} className="space-y-5">
      {coachName ?
        <p className="text-sm text-ink-muted">
          Feedback for <strong className="text-ink">{coachName}</strong>
          {clientName ? ` · ${clientName}` : ""}
        </p>
      : null}

      <div>
        <p className="mc-field-label">Rating</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              disabled={locked || busy}
              className={`size-11 rounded-full text-lg transition ${
                value <= rating ?
                  "bg-mc-brand-coach text-white"
                : "bg-line text-ink-muted hover:bg-mc-secondary-light"
              } disabled:opacity-60`}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              aria-pressed={value <= rating}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <TextAreaField
        name="comments"
        label="Comments"
        rows={4}
        disabled={locked || busy}
        placeholder="Optional notes for your coach"
      />

      <button
        type="submit"
        disabled={busy || locked}
        className="mc-btn-primary w-full sm:w-auto"
      >
        {busy ?
          "Submitting…"
        : locked ?
          "Submitted"
        : "Submit feedback"}
      </button>

      {message ?
        <AlertBanner tone={status === "success" ? "success" : "error"}>
          {message}
        </AlertBanner>
      : null}
    </form>
  );
}
