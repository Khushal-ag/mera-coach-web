/**
 * Document APIs return relative paths like `/document/CH001/….jpg`.
 * Clients must join them to the API origin (`NEXT_PUBLIC_API_BASE_URL`) —
 * same contract as mera-coach-app `src/utils/mediaUrl.ts`.
 *
 * Absolute http(s) / data URLs pass through. Empty / whitespace → "".
 * Local public fallbacks (e.g. `/mc-images/…`) must be applied by the caller
 * after resolve (`resolveMediaUrl(x) || fallback`), never fed back into resolve.
 *
 * Missing coach/client photos are an empty string. `CoachPhoto` draws initials
 * or a person outline — do not point this at a portrait file.
 */

import { env } from "@/config/env";

/** Empty on purpose: UI draws a mark instead of a stock face. */
export const COACH_PHOTO_FALLBACK = "";

function isAbsoluteUrl(url: string): boolean {
  return (
    /^https?:\/\//i.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  );
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function getApiBaseUrl(): string {
  // Prefer typed env; also read the public key directly so Next can inline it.
  const fromEnv = env.apiBaseUrl.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return trimTrailingSlash(raw);
}

/** Join a relative document path to the API origin; leave absolute URLs alone. */
export function resolveMediaUrl(url?: string | null): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";

  if (isAbsoluteUrl(trimmed)) return trimmed;

  const base = getApiBaseUrl();
  if (!base) return trimmed;
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

/**
 * Public list / profile prefers profile pic; logo is secondary when present.
 * Returns "" when neither is set so the UI can draw initials or an outline.
 */
export function resolveCoachPhotoUrl(
  coach: {
    profile_Pic_Url?: string | null;
    logo_Url?: string | null;
  },
  fallback: string = COACH_PHOTO_FALLBACK,
): string {
  return resolveMediaUrl(coach.profile_Pic_Url || coach.logo_Url) || fallback;
}
