/** Find-a-Coach filter maps — mirrors mera-coach-app `data/coachDirectory`. */

export const SORT_OPTIONS = [
  "Top Rated",
  "Most Reviewed",
  "Most Experience",
] as const;

export const RATING_FILTER_OPTIONS = ["Any rating", "4.0+", "3.0+"] as const;

/** Page sizes the public directory accepts. 12 fills the card grid; 48 is omitted so a short list does not grow a page-size control. */
export const DIRECTORY_PAGE_SIZES = [12, 24] as const;

export const DEFAULT_DIRECTORY_PAGE_SIZE = 12;

export function parseDirectoryPageSize(raw: string | undefined): number {
  const value = Number(raw);
  return (DIRECTORY_PAGE_SIZES as readonly number[]).includes(value) ?
      value
    : DEFAULT_DIRECTORY_PAGE_SIZE;
}

/** Offline seed while Master CoachType is loading — not an allowlist. */
export const FALLBACK_COACH_CATEGORIES = [
  { code: "CT001", label: "Gym Trainer" },
  { code: "CT002", label: "Health & Wellness Coach" },
  { code: "CT003", label: "Holistic Health Coach" },
  { code: "CT004", label: "Nutrition & Lifestyle Consultant" },
  { code: "CT005", label: "Personal Fitness Trainer" },
  { code: "CT006", label: "Weight Loss & Body Transformation Coach" },
  { code: "CT007", label: "Yoga & Wellness Trainer" },
  { code: "CT008", label: "Zumba" },
] as const;

export function coachPublicSortParam(
  sortLabel: string,
): "rating" | "reviews" | "experience" {
  if (sortLabel === "Most Reviewed") return "reviews";
  if (sortLabel === "Most Experience") return "experience";
  return "rating";
}

export function coachPublicMinRatingParam(
  ratingLabel: string,
): number | undefined {
  if (ratingLabel === "4.0+") return 4;
  if (ratingLabel === "3.0+") return 3;
  return undefined;
}

export function shortCategoryLabel(label: string): string {
  if (label.length <= 22) return label;
  return `${label.slice(0, 20)}…`;
}
