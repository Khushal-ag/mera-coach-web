"use client";

import Link from "next/link";

import type { ProfileCompletion } from "@/lib/profile-completion";

import { cn } from "@/lib/utils";

type ProfileCompletionCardProps = {
  completion: ProfileCompletion;
  /** Compact summary for dashboard-style surfaces; detailed checklist elsewhere. */
  variant?: "banner" | "detailed";
  className?: string;
  editHref?: string;
  showAction?: boolean;
};

export function ProfileCompletionCard({
  completion,
  variant = "banner",
  className,
  editHref = "/dashboard/profile",
  showAction = true,
}: ProfileCompletionCardProps) {
  if (completion.isPublicReady && completion.percent >= 100) return null;

  const incomplete = completion.items.filter((item) => !item.done);
  const remaining = completion.missingLabels.slice(0, 3);
  const moreCount = Math.max(
    0,
    completion.missingLabels.length - remaining.length,
  );
  const showProgressSummary =
    completion.doneCount > 0 && incomplete.length > 0 && variant === "detailed";
  const alertTone = !completion.isPublicReady;

  return (
    <section
      className={cn(
        "rounded-xl border p-4 shadow-sm sm:p-5",
        alertTone ?
          "border-mc-primary/20 bg-[color:var(--mc-primary-light)]"
        : "border-line bg-mc-secondary-light",
        className,
      )}
      aria-label="Profile completion"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg bg-white",
            alertTone ? "text-mc-primary" : "text-mc-secondary",
          )}
        >
          <i
            className={cn("fas", alertTone ? "fa-eye-slash" : "fa-star")}
            style={{ fontSize: 18 }}
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-ink">
            {completion.isPublicReady ?
              "Add remaining details"
            : "Required to go public"}
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            {completion.isPublicReady ?
              "Add a photo and remaining details so clients trust your listing."
            : incomplete.length === 0 ?
              "Every required field is filled. Save your profile to refresh your Find a Coach listing."
            : "Complete the items below before your profile shows on Find a Coach."
            }
          </p>
        </div>
        <p className="font-display text-base font-extrabold text-mc-secondary tabular-nums">
          {completion.percent}%
        </p>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuenow={completion.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-mc-secondary transition-[width]"
          style={{ width: `${completion.percent}%` }}
        />
      </div>

      {showProgressSummary ?
        <p className="mt-2 text-xs font-semibold text-ink">
          {completion.doneCount} of {completion.totalCount} complete
        </p>
      : null}

      {variant === "detailed" ?
        incomplete.length > 0 ?
          <ul className="mt-3 space-y-1.5">
            {incomplete.map((item) => (
              <li
                key={item.key}
                className="flex items-start gap-2 text-sm text-ink"
              >
                <i
                  className="far fa-circle mt-0.5 text-ink-muted"
                  style={{ fontSize: 14 }}
                  aria-hidden
                />
                <span>
                  {item.label}{" "}
                  <span className="text-ink-muted">({item.where})</span>
                </span>
              </li>
            ))}
          </ul>
        : completion.percent >= 100 ?
          <p className="mt-3 text-sm font-semibold text-mc-secondary">
            All required fields are complete.
          </p>
        : null
      : remaining.length > 0 ?
        <p className="mt-2 text-xs text-ink">
          Still needed: {remaining.join(", ")}
          {moreCount > 0 ? ` +${moreCount} more` : ""}
        </p>
      : null}

      {showAction && editHref ?
        <Link
          href={editHref}
          className="mc-btn-secondary mt-3 inline-flex min-h-10 items-center gap-2 px-4 text-sm font-semibold"
        >
          {completion.isPublicReady ? "Edit profile" : "Complete profile"}
          <i
            className="fas fa-arrow-right"
            style={{ fontSize: 12 }}
            aria-hidden
          />
        </Link>
      : null}
    </section>
  );
}
