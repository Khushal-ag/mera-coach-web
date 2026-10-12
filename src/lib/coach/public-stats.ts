/**
 * Public stats for the digital profile.
 * Rating is a formula and reviewCount is not a review total — do not show either.
 */

export type PublicStatItem = {
  key: string;
  value: string;
  label: string;
};

function shouldShowPublicClientCount(
  count: number | null | undefined,
): boolean {
  return count != null && count > 0;
}

/** Formula ratings are not client reviews. */
function shouldShowPublicRating(_rating: number, _reviews: number): boolean {
  return false;
}

export function buildPublicProfileStats(opts: {
  clientCount: number | null | undefined;
  experience: number;
  servicesCount: number;
  rating: number;
  reviews: number;
  certificationCount?: number;
}): PublicStatItem[] {
  const items: PublicStatItem[] = [];

  if (shouldShowPublicClientCount(opts.clientCount)) {
    items.push({
      key: "clients",
      value: `${opts.clientCount}+`,
      label: "Happy clients",
    });
  }

  if (opts.experience > 0) {
    items.push({
      key: "experience",
      value: String(opts.experience),
      label: "Years exp.",
    });
  }

  if (opts.servicesCount > 0) {
    items.push({
      key: "services",
      value: String(opts.servicesCount),
      label: "Services",
    });
  }

  if (opts.certificationCount != null && opts.certificationCount > 0) {
    items.push({
      key: "certs",
      value: String(opts.certificationCount),
      label: "Certifications",
    });
  }

  if (shouldShowPublicRating(opts.rating, opts.reviews)) {
    items.push({
      key: "rating",
      value: String(opts.rating),
      label: "Rating",
    });
  }

  return items;
}
