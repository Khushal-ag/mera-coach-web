import type { ApiError, GenericResponse } from "@/lib/api/types";

/** Read the first defined key from a camelCase / PascalCase ASP.NET payload. */
export function pick<T>(
  obj: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key] as T;
  }
  return undefined;
}

/** Normalize ASP.NET payloads that may arrive as camelCase or PascalCase. */
export function normalizeApiBody<T>(raw: unknown): GenericResponse<T> {
  if (!raw || typeof raw !== "object") {
    return { errorObj: [], responseObj: null };
  }
  const record = raw as Record<string, unknown>;
  const errorRaw = (record.errorObj ?? record.ErrorObj ?? []) as unknown[];
  const responseObj = (record.responseObj ??
    record.ResponseObj ??
    null) as T | null;
  const errorObj: ApiError[] = errorRaw.map((item) => {
    if (!item || typeof item !== "object") {
      return { errorCode: -1, errorMessage: "Unknown error" };
    }
    const err = item as Record<string, unknown>;
    return {
      errorCode: Number(err.errorCode ?? err.ErrorCode ?? -1),
      errorMessage: String(
        err.errorMessage ?? err.ErrorMessage ?? "Unknown error",
      ),
    };
  });
  return { errorObj, responseObj };
}

export function firstApiError(
  response: GenericResponse<unknown> | null | undefined,
) {
  return response?.errorObj?.[0]?.errorMessage ?? null;
}

/** errorCode 1 = no records: empty success (same as mera-coach-app). */
const API_ERROR_NO_RECORDS = 1;

export function isNoRecordsResponse(
  response: GenericResponse<unknown> | null | undefined,
) {
  const entries = response?.errorObj ?? [];
  if (entries.length === 0) return false;
  return (
    entries.every((e) => {
      const code = Number(e.errorCode);
      return code === API_ERROR_NO_RECORDS || code === 0;
    }) && entries.some((e) => Number(e.errorCode) === API_ERROR_NO_RECORDS)
  );
}

export function isApiSuccess(
  response: GenericResponse<unknown> | null | undefined,
) {
  if (isNoRecordsResponse(response)) return true;
  const code = response?.errorObj?.[0]?.errorCode;
  return code === undefined || code === 0;
}
