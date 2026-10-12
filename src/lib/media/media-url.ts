/**
 * Document APIs return relative paths like `/document/CH001/….jpg`.
 * Clients must join them to the API origin (`NEXT_PUBLIC_API_BASE_URL`) —
 * same contract as mera-coach-app `src/utils/mediaUrl.ts`.
 *
 * Absolute http(s) / data URLs pass through. Empty / whitespace → "".
 * Local public fallbacks (e.g. `/mc-images/…`) must be applied by the caller
 * after resolve (`resolveMediaUrl(x) || fallback`), never fed back into resolve.
 */

import { env } from "@/config/env";

export const COACH_PHOTO_FALLBACK = "/mc-images/services-1.jpg";

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
 * Always returns a usable src (API absolute URL or local fallback).
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
