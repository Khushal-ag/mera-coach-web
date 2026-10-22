"use client";

import { useState } from "react";

import {
  BarChart3,
  GraduationCap,
  MessageCircle,
  MessageSquare,
  Star,
  User,
} from "lucide-react";

import type { RatingIcon, RatingKey } from "@/constants/feedback";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField } from "@/components/ui/field";
import { siteConfig } from "@/config/site";
import { RATING_LABELS, RATING_PARAMETERS } from "@/constants/feedback";
import { submitFeedback } from "@/lib/api/feedback";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { appHomeDeepLink } from "@/lib/app-deep-link";
import { cn } from "@/lib/utils";

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
  const [scores, setScores] = useState<Record<RatingKey, number>>({
    knowledge: 0,
    communication: 0,
    personalAttention: 0,
    guidanceResponse: 0,
    resultsProgress: 0,
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    if (status === "success" || status === "loading") return;
    if (RATING_PARAMETERS.some(({ key }) => scores[key] < 1)) {
      setStatus("error");
      setMessage("Please rate every parameter.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    try {
      const response = await submitFeedback({
        coachCode,
        clientCode,
        ...scores,
        comments: String(formData.get("comments") ?? "").trim() || undefined,
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
  const rating = overallRating(scores);

  return (
    <div className="space-y-5">
      <ParticipantNames coachName={coachName} clientName={clientName} />
      {status === "success" ?
        <FeedbackThanks
          coachName={coachName}
          clientName={clientName}
          rating={Math.round(rating * 10) / 10}
          message={message}
        />
      : <form
          action={onSubmit}
          className="space-y-6 rounded-[22px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8"
        >
          <div className="overflow-hidden rounded-2xl border border-line">
            <ul className="divide-y divide-line px-3 sm:px-5">
              {RATING_PARAMETERS.map(({ key, label, icon }) => (
                <li
                  key={key}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mc-accent/10 text-mc-accent">
                      <ParameterIcon icon={icon} />
                    </span>
                    <span
                      id={`feedback-${key}-label`}
                      className="font-display text-base font-bold text-mc-secondary"
                    >
                      {label}
                    </span>
                  </div>
                  <StarRow
                    labelledBy={`feedback-${key}-label`}
                    value={scores[key]}
                    disabled={busy}
                    onChange={(value) =>
                      setScores((prev) => ({ ...prev, [key]: value }))
                    }
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-mc-accent/10 px-4 py-4 sm:px-5">
            <div>
              <p className="font-display text-lg font-bold text-mc-secondary">
                Overall Rating
              </p>
              <p className="text-sm text-ink-muted" aria-live="polite">
                {rating > 0 ?
                  `${rating.toFixed(1)} of 5 · ${RATING_LABELS[Math.round(rating)]}`
                : "Rate each parameter above"}
              </p>
            </div>
            <div className="flex gap-1 text-mc-accent" aria-hidden>
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className="size-6 sm:size-7"
                  strokeWidth={1.75}
                  fill={value <= Math.round(rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>

          <TextAreaField
            name="comments"
            label="Comments (Optional)"
            rows={5}
            maxLength={1000}
            disabled={busy}
            placeholder="Share your experience, what stood out, and what could be better?"
            inputClassName="min-h-36"
          />

          <p className="text-xs text-ink-muted">
            Your first name, ratings and comment appear on the coach&apos;s
            public profile. Only your latest feedback counts.
          </p>

          {status === "error" && message ?
            <AlertBanner tone="error">{message}</AlertBanner>
          : null}

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="mc-btn-primary w-full"
          >
            {busy ? "Submitting feedback" : "Submit Feedback"}
          </button>
        </form>
      }
    </div>
  );
}

/** Average of the five parameters, 0 until every one is rated. Mirrors the API formula. */
function overallRating(scores: Record<RatingKey, number>) {
  const values = RATING_PARAMETERS.map(({ key }) => scores[key]);
  if (values.some((value) => value < 1)) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function ParameterIcon({ icon }: { icon: RatingIcon }) {
  const className = "size-5";
  switch (icon) {
    case "graduation":
      return <GraduationCap className={className} aria-hidden />;
    case "chat":
      return <MessageCircle className={className} aria-hidden />;
    case "person":
      return <User className={className} aria-hidden />;
    case "message":
      return <MessageSquare className={className} aria-hidden />;
    case "progress":
      return <BarChart3 className={className} aria-hidden />;
  }
}

function StarRow({
  labelledBy,
  value,
  disabled,
  onChange,
}: {
  labelledBy: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="flex gap-1 sm:gap-1.5"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full transition disabled:opacity-60 sm:size-10",
              selected ? "text-mc-accent" : (
                "text-ink-muted/50 hover:text-mc-accent/70"
              ),
            )}
          >
            <Star
              className="size-6 sm:size-7"
              strokeWidth={1.75}
              fill="currentColor"
              aria-hidden
            />
          </button>
        );
      })}
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
