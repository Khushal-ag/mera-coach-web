"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ReviewsPage } from "@/types/reviews";

import {
  ReviewCard,
  ReviewSummaryCard,
} from "@/components/reviews/review-parts";
import { fetchPublicReviews } from "@/lib/api/reviews";

/** Reviews section on the public coach profile. Shows nothing until a client has left one. */
export function CoachReviews({
  coachCode,
  initial,
}: {
  coachCode: string;
  initial: ReviewsPage;
}) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.page);
  const [busy, setBusy] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const hasMore = items.length < initial.totalCount;

  const syncArrows = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / (el.clientWidth + 16)));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    window.addEventListener("resize", syncArrows);
    return () => window.removeEventListener("resize", syncArrows);
  }, [items.length, syncArrows]);

  const loadMore = useCallback(async () => {
    if (busy || !hasMore) return;
    setBusy(true);
    try {
      const next = await fetchPublicReviews(coachCode, page + 1);
      setItems((prev) => [...prev, ...next.items]);
      setPage(next.page);
    } catch {
      // The arrows simply stop at the last review that loaded.
    } finally {
      setBusy(false);
    }
  }, [busy, hasMore, coachCode, page]);

  function scrollByView(direction: 1 | -1) {
    const el = track.current;
    if (!el) return;
    el.scrollBy({
      left: direction * (el.clientWidth + 16),
      behavior: "smooth",
    });
    // Fetch the next page as the last reviews come into view.
    if (
      direction === 1 &&
      el.scrollLeft + el.clientWidth * 1.9 >= el.scrollWidth
    ) {
      void loadMore();
    }
  }

  if (initial.items.length === 0) return null;
  const many = items.length > 1;

  return (
    <section className="py-10 sm:py-14" id="reviews">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-star" /> Reviews
          </div>
          <h2 className="section-title">What clients say</h2>
        </div>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[26px] border border-line bg-white md:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="border-b border-line p-6 md:border-r md:border-b-0">
            <ReviewSummaryCard summary={initial.summary} bare />
          </div>
          <div className="min-w-0 p-5 sm:p-6">
            <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
              <p className="font-display text-sm font-bold text-ink">
                {many ? "Latest reviews" : "Latest review"}
              </p>
              {items.length > 0 ?
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mc-accent hover:text-mc-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
                    aria-label="Previous review"
                    disabled={!canPrev}
                    onClick={() => scrollByView(-1)}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:border-mc-accent hover:text-mc-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
                    aria-label="Next review"
                    disabled={!canNext && !hasMore}
                    onClick={() => scrollByView(1)}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </div>
              : null}
            </div>
            <div
              ref={track}
              onScroll={syncArrows}
              className="flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
              aria-label="Client reviews"
            >
              {items.map((review) => (
                <ReviewCard
                  key={review.feedbackId}
                  review={review}
                  soft
                  className="min-h-44 w-full shrink-0 snap-center"
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden>
                {items.slice(0, 8).map((review, dot) => (
                  <span
                    key={review.feedbackId}
                    className={`h-1.5 rounded-full transition-all ${
                      dot === Math.min(index, 7) ?
                        "w-5 bg-mc-accent"
                      : "w-1.5 bg-line"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink-muted">
                {Math.min(index + 1, initial.totalCount)} / {initial.totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
