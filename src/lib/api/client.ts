import type { GenericResponse } from "@/lib/api/types";

import { assertApiBaseUrl } from "@/config/env";
import { normalizeApiBody } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import { clearSession, getCurrentToken } from "@/lib/auth/session";

export type ApiFetchOptions = RequestInit & {
  /** Override Next.js fetch caching. Defaults to no-store for mutations and dynamic lists. */
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
  /** Skip Authorization even if a coach session exists (rare). */
  skipAuth?: boolean;
};

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
  const { next, cache, headers, skipAuth, ...rest } = init ?? {};
  const token = skipAuth ? null : getCurrentToken();

  const res = await fetch(apiUrl(path), {
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
    const message =
      errors[0]?.errorMessage ?? `Request failed with status ${res.status}`;
    throw new ApiRequestError(message, res.status, errors);
  }

  return body ?? { errorObj: [], responseObj: null };
}
