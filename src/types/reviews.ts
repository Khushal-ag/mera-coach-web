/** Matches meracoachapi CoachReviewsResponse (camelCase JSON). */
export type ReviewSummary = {
  reviewCount: number;
  average: number;
  knowledge: number;
  communication: number;
  personalAttention: number;
  guidanceResponse: number;
  resultsProgress: number;
  /** Reviews per whole star: index 0 is one star, index 4 is five stars. */
  starCounts: number[];
};

export type Review = {
  feedbackId: number;
  /** Empty on the public list. */
  clientCode: string;
  clientName: string;
  knowledge: number;
  communication: number;
  personalAttention: number;
  guidanceResponse: number;
  resultsProgress: number;
  overall: number;
  comments: string;
  /** ISO date-time. */
  createdOn: string;
};

export type ReviewsPage = {
  summary: ReviewSummary;
  items: Review[];
  page: number;
  totalCount: number;
};
