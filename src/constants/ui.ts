/** Display limits and timings shared by the UI. Change here, not at the call site. */

/** Public coach profile: show this many before "Show all". */
export const PROFILE_VISIBLE = {
  packages: 3,
  events: 3,
  gallery: 12,
} as const;

/** Coach dashboard carousel. */
export const DASHBOARD_CAROUSEL = {
  maxSlides: 6,
  intervalMs: 6000,
} as const;
