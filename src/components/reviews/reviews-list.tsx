"use client";

import { useState } from "react";

import type { ReviewsPage } from "@/types/reviews";

import {
  ReviewCard,
  ReviewSummaryCard,
} from "@/components/reviews/review-parts";
import { REVIEWS_PAGE_SIZE } from "@/lib/api/reviews";

/**
 * Summary, review cards and "Show more". The first page comes from the caller; later pages load
 * with `loadPage`, which differs for the public profile and the coach dashboard.
 */
export function ReviewsList({
  initial,
  loadPage,
  showSummary = true,
}: {
  initial: ReviewsPage;
  loadPage: (page: number) => Promise<ReviewsPage>;
  showSummary?: boolean;
}) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.page);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (initial.items.length === 0) return null;
  const hasMore = items.length < initial.totalCount;

  async function showMore() {
    setBusy(true);
    setFailed(false);
    try {
      const next = await loadPage(page + 1);
      setItems((prev) => [...prev, ...next.items]);
      setPage(next.page);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {showSummary ?
        <ReviewSummaryCard summary={initial.summary} />
      : null}
      {items.map((review) => (
        <ReviewCard key={review.feedbackId} review={review} />
      ))}
      {hasMore ?
        <button
          type="button"
          className="mc-btn-secondary w-full sm:w-auto"
          onClick={() => void showMore()}
          disabled={busy}
        >
          {busy ?
            "Loading"
          : `Show more reviews (${REVIEWS_PAGE_SIZE} at a time)`}
        </button>
      : null}
      {failed ?
        <p className="text-sm text-red-700">Could not load more reviews.</p>
      : null}
    </div>
  );
}
