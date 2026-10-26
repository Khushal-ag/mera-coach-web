import type { ApiError, GenericResponse } from "@/lib/api/types";

import { API_ERROR_NO_RECORDS } from "@/constants/api";

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

  // Extract ASP.NET ValidationProblemDetails / RFC 7807 problem details if no custom errors
  if (errorObj.length === 0) {
    const aspErrors = record.errors ?? record.Errors;
    if (aspErrors && typeof aspErrors === "object") {
      for (const msgs of Object.values(aspErrors as Record<string, unknown>)) {
        if (Array.isArray(msgs)) {
          for (const msg of msgs) {
            if (typeof msg === "string" && msg.trim()) {
              errorObj.push({ errorCode: 400, errorMessage: msg.trim() });
            }
          }
        } else if (typeof msgs === "string" && msgs.trim()) {
          errorObj.push({ errorCode: 400, errorMessage: msgs.trim() });
        }
      }
    } else if (typeof record.detail === "string" && record.detail.trim()) {
      errorObj.push({ errorCode: -1, errorMessage: record.detail.trim() });
    } else if (
      typeof record.title === "string" &&
      record.title.trim() &&
      record.title !== "One or more validation errors occurred."
    ) {
      errorObj.push({ errorCode: -1, errorMessage: record.title.trim() });
    }
  }

  return { errorObj, responseObj };
}

export function firstApiError(
  response: GenericResponse<unknown> | null | undefined,
) {
  return response?.errorObj?.[0]?.errorMessage ?? null;
}

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
