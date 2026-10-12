import { apiFetch } from "@/lib/api/client";
import {
  firstApiError,
  isApiSuccess,
  isNoRecordsResponse,
} from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";

export type AuthedFetchOptions = {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
};

/**
 * Authenticated coach calls → meracoachapi directly (Bearer from session).
 * Paths are API-relative without leading slash, e.g. `v1/Client/ClientList`.
 */
export async function authedFetch<T>(
  path: string,
  options: AuthedFetchOptions = {},
): Promise<T> {
  const normalized = path.replace(/^\//, "");
  const qs = new URLSearchParams();
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      qs.set(key, String(value));
    }
  }
  const query = qs.toString();
  const apiPath = `/${normalized}${query ? `?${query}` : ""}`;

  const envelope = await apiFetch<T>(apiPath, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!isApiSuccess(envelope)) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Request was not successful.",
      400,
      envelope.errorObj ?? [],
    );
  }

  if (isNoRecordsResponse(envelope)) {
    return (envelope.responseObj ?? null) as T;
  }

  return (envelope.responseObj ?? null) as T;
}
