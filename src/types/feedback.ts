/** Matches meracoachapi FeedbackContextResponse (camelCase JSON). */
export type FeedbackContext = {
  coachCode?: string;
  coachName?: string;
  clientCode?: string;
  clientName?: string;
};

export type FeedbackSubmitInput = {
  coachCode: string;
  clientCode: string;
  knowledge: number;
  communication: number;
  personalAttention: number;
  guidanceResponse: number;
  resultsProgress: number;
  comments?: string;
};
