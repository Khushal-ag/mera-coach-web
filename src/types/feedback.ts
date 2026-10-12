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
  rating: number;
  comments?: string;
  clientName?: string;
};
