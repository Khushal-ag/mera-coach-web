/** Feedback form. */

export const RATING_LABELS = [
  "",
  "Poor",
  "Fair",
  "Okay",
  "Good",
  "Excellent",
] as const;

/** The five parameters a client rates. The overall rating is their average and is never stored. */
export const RATING_PARAMETERS = [
  { key: "knowledge", label: "Knowledge", icon: "graduation" },
  { key: "communication", label: "Communication", icon: "chat" },
  { key: "personalAttention", label: "Personal Attention", icon: "person" },
  { key: "guidanceResponse", label: "Guidance & Response", icon: "message" },
  { key: "resultsProgress", label: "Results & Progress", icon: "progress" },
] as const;

export type RatingKey = (typeof RATING_PARAMETERS)[number]["key"];
export type RatingIcon = (typeof RATING_PARAMETERS)[number]["icon"];
