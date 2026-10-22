import { Star } from "lucide-react";

import type { Review, ReviewSummary } from "@/types/reviews";

import { formatDateLabel } from "@/lib/format";

const REVIEW_PARAMETERS = [
  { key: "knowledge", label: "Knowledge" },
  { key: "communication", label: "Communication" },
  { key: "personalAttention", label: "Personal Attention" },
  { key: "guidanceResponse", label: "Guidance & Response" },
  { key: "resultsProgress", label: "Results & Progress" },
] as const;

/** Five stars, filled up to the rounded value. */
function StarRow({
  value,
  className = "size-4",
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.round(value);
  return (
    <span
      className="inline-flex gap-0.5 text-mc-accent"
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= filled ? "" : "text-line"}`}
          strokeWidth={1.75}
          fill={n <= filled ? "currentColor" : "none"}
          aria-hidden
        />
      ))}
    </span>
  );
}

function Bar({ ratio }: { ratio: number }) {
  return (
    <span className="h-2 flex-1 overflow-hidden rounded-full bg-line/70">
      <span
        className="block h-2 rounded-full bg-mc-accent"
        style={{ width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }}
      />
    </span>
  );
}

/** Average, star breakdown and per-parameter averages, like a product review summary. */
export function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  if (summary.reviewCount === 0) return null;
  return (
    <div className="rounded-[22px] border border-line bg-white p-5">
      <div className="flex items-center gap-4">
        <p className="font-display text-5xl font-extrabold text-ink">
          {summary.average.toFixed(1)}
        </p>
        <div className="space-y-1">
          <StarRow value={summary.average} className="size-5" />
          <p className="text-sm text-ink-muted">
            {summary.reviewCount}{" "}
            {summary.reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.starCounts[star - 1] ?? 0;
          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-10 font-semibold text-ink">{star} star</span>
              <Bar ratio={count / summary.reviewCount} />
              <span className="w-6 text-right text-ink-muted">{count}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 border-t border-line pt-4">
        {REVIEW_PARAMETERS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 text-xs">
            <span className="w-36 font-semibold text-ink">{label}</span>
            <Bar ratio={summary[key] / 5} />
            <span className="w-7 text-right font-semibold text-ink">
              {summary[key].toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One client's review. Read-only: there is no edit or remove control. */
export function ReviewCard({ review }: { review: Review }) {
  const initial = (review.clientName.trim()[0] ?? "?").toUpperCase();
  return (
    <article className="rounded-[22px] border border-line bg-white p-5">
      <header className="flex items-center gap-3">
        <span
          className="inline-flex size-10 items-center justify-center rounded-full bg-mc-secondary/10 font-display font-bold text-mc-secondary"
          aria-hidden
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-ink">
            {review.clientName || "A client"}
          </p>
          <p className="text-xs text-ink-muted">
            {formatDateLabel(review.createdOn.slice(0, 10))}
          </p>
        </div>
        <p className="font-display font-bold text-ink">
          {review.overall.toFixed(1)}
        </p>
      </header>
      <div className="mt-2">
        <StarRow value={review.overall} />
      </div>
      {review.comments ?
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {review.comments}
        </p>
      : null}
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {REVIEW_PARAMETERS.map(({ key, label }) => (
          <li
            key={key}
            className="rounded-full bg-mc-accent/10 px-2.5 py-1 text-[11px] font-semibold text-ink-muted"
          >
            {label} {review[key]}/5
          </li>
        ))}
      </ul>
    </article>
  );
}
