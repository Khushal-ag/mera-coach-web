import type { GenericResponse } from "@/lib/api/types";

import { assertApiBaseUrl } from "@/config/env";
import { normalizeApiBody } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import { clearSession, getCurrentToken } from "@/lib/auth/session";

type ApiFetchOptions = RequestInit & {
  /**
   * Public GETs pass `next.revalidate` and `skipAuth` so they can be cached.
   * Authenticated calls omit `next` and use `cache: "no-store"`.
   */
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
  /** Skip Authorization even if a coach session exists (rare). */
  skipAuth?: boolean;
  /** Use this token instead of the session token, for example the registration upload token. */
  bearer?: string;
};

/** Plain-language text for responses that carry no message of their own. */
function statusMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403)
    return "You do not have access to this. It may belong to another account.";
  if (status === 404) return "We could not find what you asked for.";
  if (status === 429)
    return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500)
    return "Something went wrong on our side. Please try again shortly.";
  return "The request could not be completed. Please try again.";
}

function apiUrl(path: string) {
  const base = assertApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Typed fetch wrapper for meracoachapi (direct browser/server → API).
 * When a coach JWT is in session, sends `Authorization: Bearer …` like the Expo app.
 */
export async function apiFetch<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<GenericResponse<T>> {
  const { next, cache, headers, skipAuth, bearer, ...rest } = init ?? {};
  const token = bearer ?? (skipAuth ? null : getCurrentToken());

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      ...(next ? { next } : {}),
      ...(cache ? { cache }
      : next ? {}
      : { cache: "no-store" }),
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the server. Check your connection and try again.",
      0,
      [],
    );
  }

  let body: GenericResponse<T> | null = null;
  try {
    body = normalizeApiBody<T>(await res.json());
  } catch {
    body = null;
  }

  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
  }

  if (!res.ok) {
    const errors = body?.errorObj ?? [];
    const message = errors[0]?.errorMessage ?? statusMessage(res.status);
    throw new ApiRequestError(message, res.status, errors);
  }

  return body ?? { errorObj: [], responseObj: null };
}
