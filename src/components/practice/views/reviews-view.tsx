"use client";

import { useEffect, useState } from "react";

import type { ReviewsPage } from "@/types/reviews";

import { EmptyState } from "@/components/practice/empty-state";
import { PracticePageHeader } from "@/components/practice/page-header";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchMyReviews } from "@/lib/api/reviews";

function ReviewsLoadingSkeleton() {
  return (
    <div
      className="mc-panel grid gap-3 p-4 sm:p-6"
      aria-busy="true"
      aria-label="Loading reviews"
    >
      <div className="mc-skeleton h-24 w-full rounded-2xl" />
      <div className="mc-skeleton h-28 w-full rounded-2xl" />
      <div className="mc-skeleton h-28 w-full rounded-2xl" />
    </div>
  );
}

/** Feedback clients have left for this coach. Read-only: a coach cannot edit or remove a review. */
export function ReviewsView() {
  const [data, setData] = useState<ReviewsPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchMyReviews()
      .then((page) => {
        if (!cancelled) setData(page);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load your reviews.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Reviews"
        description="Each client's latest feedback counts toward your rating. Reviews are shown as the client wrote them."
        icon={
          <i className="fas fa-star" style={{ fontSize: 20 }} aria-hidden />
        }
      />
      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {loading ?
        <ReviewsLoadingSkeleton />
      : data && data.items.length === 0 ?
        <EmptyState
          icon="fas fa-comment-dots"
          title="No reviews yet"
          description="Ask a client for feedback from their profile. Their review shows up here."
        />
      : data ?
        <ReviewsList
          initial={data}
          loadPage={(page) => fetchMyReviews({ page })}
        />
      : null}
    </div>
  );
}
