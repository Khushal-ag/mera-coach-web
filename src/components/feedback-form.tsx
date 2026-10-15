"use client";

import { useState } from "react";

import { Star } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField } from "@/components/ui/field";
import { siteConfig } from "@/config/site";
import { submitFeedback } from "@/lib/api/feedback";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { appHomeDeepLink } from "@/lib/app-deep-link";
import { cn } from "@/lib/utils";

const RATING_LABELS = [
  "",
  "Poor",
  "Fair",
  "Okay",
  "Good",
  "Excellent",
] as const;

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

  async function onSubmit(formData: FormData) {
    if (status === "success" || status === "loading") return;
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
      setMessage("Thanks for your feedback.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not submit feedback.",
      );
    }
  }

  const busy = status === "loading";

  return (
    <div className="space-y-5">
      <ParticipantNames coachName={coachName} clientName={clientName} />
      {status === "success" ?
        <FeedbackThanks
          coachName={coachName}
          clientName={clientName}
          rating={rating}
          message={message}
        />
      : <form
          action={onSubmit}
          className="space-y-6 rounded-[22px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8"
        >
          <div className="space-y-3">
            <p id="feedback-rating-label" className="mc-field-label">
              Rating
            </p>
            <div
              role="radiogroup"
              aria-labelledby="feedback-rating-label"
              aria-describedby="feedback-rating-value"
              className="grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:gap-3"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={value === rating}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    disabled={busy}
                    onClick={() => setRating(value)}
                    className={cn(
                      "inline-flex h-11 min-h-11 w-full min-w-11 items-center justify-center rounded-2xl border transition sm:size-12 sm:w-12 sm:rounded-full",
                      selected ?
                        "border-[color:var(--mc-accent)] bg-[color:var(--mc-accent)] text-white"
                      : "border-2 border-mc-secondary bg-white text-mc-secondary hover:bg-mc-secondary hover:text-white",
                      "disabled:opacity-60",
                    )}
                  >
                    <Star
                      className="size-6 sm:size-7"
                      strokeWidth={1.75}
                      fill={selected ? "currentColor" : "none"}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
            <p id="feedback-rating-value" className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">{rating} of 5</span>
              <span className="mx-1.5 text-line" aria-hidden>
                ·
              </span>
              <span className="font-semibold text-mc-accent">
                {RATING_LABELS[rating] ?? "Excellent"}
              </span>
            </p>
          </div>

          <TextAreaField
            name="comments"
            label="Comments"
            rows={6}
            maxLength={1000}
            disabled={busy}
            placeholder="What stood out, and what could be better?"
            hint="Optional."
            inputClassName="min-h-36"
          />

          {status === "error" && message ?
            <AlertBanner tone="error">{message}</AlertBanner>
          : null}

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="mc-btn-primary w-full"
          >
            {busy ? "Submitting feedback" : "Submit feedback"}
          </button>
        </form>
      }
    </div>
  );
}

function ParticipantNames({
  coachName,
  clientName,
}: {
  coachName?: string;
  clientName?: string;
}) {
  if (!coachName && !clientName) return null;

  return (
    <dl
      className={cn("grid gap-3", coachName && clientName && "sm:grid-cols-2")}
    >
      {coachName ?
        <NameCard label="Coach" value={coachName} />
      : null}
      {clientName ?
        <NameCard label="Client" value={clientName} />
      : null}
    </dl>
  );
}

function NameCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(44,24,16,0.04)]">
      <dt className="font-display text-xs font-bold tracking-wide text-mc-accent">
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg leading-snug font-bold break-words text-mc-secondary">
        {value}
      </dd>
    </div>
  );
}

function FeedbackThanks({
  coachName,
  clientName,
  rating,
  message,
}: {
  coachName?: string;
  clientName?: string;
  rating: number;
  message: string | null;
}) {
  const firstName = clientName?.trim().split(/\s+/)[0];
  const coach = coachName?.trim();

  return (
    <section
      aria-labelledby="feedback-thanks-title"
      className="rounded-[22px] border border-line bg-white px-4 py-8 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:px-10 sm:py-12"
    >
      <div className="flex gap-1.5 text-mc-accent" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className="size-8"
            strokeWidth={1.75}
            fill={index < rating ? "currentColor" : "none"}
          />
        ))}
      </div>
      <h2
        id="feedback-thanks-title"
        className="mt-5 font-display text-3xl font-extrabold text-mc-secondary sm:text-4xl"
      >
        Thank you
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
        {firstName ? `${firstName}, ` : ""}
        {coach ?
          `${coach} has your rating of ${rating} out of 5.`
        : `Your coach has your rating of ${rating} out of 5.`}{" "}
        You can close this page whenever you are done.
      </p>
      <AlertBanner tone="success" className="mt-6">
        {message ?? "Thanks for your feedback."}
      </AlertBanner>
      <a
        href={appHomeDeepLink()}
        className="mc-btn-secondary mt-6 inline-flex w-full"
      >
        {siteConfig.app.handoffLabel}
      </a>
      <p className="mt-3 text-sm text-ink-muted">
        Optional. No website login is needed.
      </p>
    </section>
  );
}
