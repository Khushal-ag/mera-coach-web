import type { GenericResponse } from "@/lib/api/types";

import { assertApiBaseUrl } from "@/config/env";
import { normalizeApiBody } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";

export type ApiFetchOptions = RequestInit & {
  /** Override Next.js fetch caching. Defaults to no-store for mutations and dynamic lists. */
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
};

function apiUrl(path: string) {
  const base = assertApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Typed fetch wrapper for meracoachapi.
 * Public marketing GETs may pass `next: { revalidate }` for ISR-style caching.
 */
export async function apiFetch<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<GenericResponse<T>> {
  const { next, cache, headers, ...rest } = init ?? {};
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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

  if (!res.ok) {
    const errors = body?.errorObj ?? [];
    const message =
      errors[0]?.errorMessage ?? `Request failed with status ${res.status}`;
    throw new ApiRequestError(message, res.status, errors);
  }

  return body ?? { errorObj: [], responseObj: null };
}
