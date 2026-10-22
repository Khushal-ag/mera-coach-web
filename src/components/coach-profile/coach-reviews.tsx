"use client";

import type { ReviewsPage } from "@/types/reviews";

import { ReviewsList } from "@/components/reviews/reviews-list";
import { fetchPublicReviews } from "@/lib/api/reviews";

/** Reviews section on the public coach profile. Shows nothing until a client has left one. */
export function CoachReviews({
  coachCode,
  initial,
}: {
  coachCode: string;
  initial: ReviewsPage;
}) {
  if (initial.items.length === 0) return null;
  return (
    <section className="py-10 sm:py-14" id="reviews">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-star" /> Reviews
          </div>
          <h2 className="section-title">What clients say</h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <ReviewsList
            initial={initial}
            loadPage={(page) => fetchPublicReviews(coachCode, page)}
          />
        </div>
      </div>
    </section>
  );
}
