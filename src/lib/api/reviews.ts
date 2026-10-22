import type { Review, ReviewsPage } from "@/types/reviews";

import { authedFetch } from "@/lib/api/authed";
import { apiFetch } from "@/lib/api/client";
import { isApiSuccess } from "@/lib/api/normalize";

export const REVIEWS_PAGE_SIZE = 10;

const EMPTY: ReviewsPage = {
  summary: {
    reviewCount: 0,
    average: 0,
    knowledge: 0,
    communication: 0,
    personalAttention: 0,
    guidanceResponse: 0,
    resultsProgress: 0,
    starCounts: [0, 0, 0, 0, 0],
  },
  items: [],
  page: 1,
  totalCount: 0,
};

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function text(value: unknown): string {
  return (
    typeof value === "string" ? value
    : value == null ? ""
    : String(value)
  );
}

function mapReviews(raw: unknown): ReviewsPage {
  const r = (raw ?? {}) as Record<string, unknown>;
  const s = (r.summary ?? {}) as Record<string, unknown>;
  const stars = Array.isArray(s.starCounts) ? s.starCounts.map(num) : [];
  return {
    summary: {
      reviewCount: num(s.reviewCount),
      average: num(s.average),
      knowledge: num(s.knowledge),
      communication: num(s.communication),
      personalAttention: num(s.personalAttention),
      guidanceResponse: num(s.guidanceResponse),
      resultsProgress: num(s.resultsProgress),
      starCounts: [0, 1, 2, 3, 4].map((i) => stars[i] ?? 0),
    },
    items: (Array.isArray(r.items) ? r.items : []).map((item): Review => {
      const i = (item ?? {}) as Record<string, unknown>;
      return {
        feedbackId: num(i.feedbackId),
        clientCode: text(i.clientCode),
        clientName: text(i.clientName),
        knowledge: num(i.knowledge),
        communication: num(i.communication),
        personalAttention: num(i.personalAttention),
        guidanceResponse: num(i.guidanceResponse),
        resultsProgress: num(i.resultsProgress),
        overall: num(i.overall),
        comments: text(i.comments).trim(),
        createdOn: text(i.createdOn),
      };
    }),
    page: num(r.page) || 1,
    totalCount: num(r.totalCount),
  };
}

/** A coach's public reviews: each client's latest feedback, first names only. */
export async function fetchPublicReviews(
  coachCode: string,
  page = 1,
): Promise<ReviewsPage> {
  if (!coachCode) return EMPTY;
  const query = new URLSearchParams({
    coachCode,
    page: String(page),
    pageSize: String(REVIEWS_PAGE_SIZE),
  });
  const response = await apiFetch<unknown>(`/v1/Coach/reviews?${query}`, {
    next: { revalidate: 60 },
    skipAuth: true,
  });
  return isApiSuccess(response) ? mapReviews(response.responseObj) : EMPTY;
}

/** The signed-in coach's own reviews, with full client names. Read-only. */
export async function fetchMyReviews(
  options: { clientCode?: string; page?: number } = {},
): Promise<ReviewsPage> {
  const raw = await authedFetch<unknown>("v1/Coach/my-reviews", {
    searchParams: {
      clientCode: options.clientCode,
      page: options.page ?? 1,
      pageSize: REVIEWS_PAGE_SIZE,
    },
  });
  return mapReviews(raw);
}
