import { describe, expect, test } from "bun:test";

import { API_ERROR_NO_RECORDS } from "@/constants/api";

import {
  firstApiError,
  isApiSuccess,
  isNoRecordsResponse,
  normalizeApiBody,
  pick,
} from "../api/normalize";

describe("api normalize", () => {
  test("picks values case-insensitively / fallback keys", () => {
    const obj = { CoachName: "John", age: 30 };
    expect(pick(obj, "coachName", "CoachName")).toBe("John");
    expect(pick(obj, "missing", "age")).toBe(30);
    expect(pick(obj, "none")).toBeUndefined();
  });

  test("normalizes standard errorObj envelopes", () => {
    const raw = {
      errorObj: [{ errorCode: 0, errorMessage: "Success" }],
      responseObj: { id: 1 },
    };
    const normalized = normalizeApiBody<{ id: number }>(raw);
    expect(normalized.errorObj?.[0]?.errorCode).toBe(0);
    expect(normalized.responseObj?.id).toBe(1);
    expect(isApiSuccess(normalized)).toBe(true);
  });

  test("normalizes ASP.NET PascalCase ErrorObj envelopes", () => {
    const raw = {
      ErrorObj: [{ ErrorCode: 401, ErrorMessage: "Invalid User" }],
      ResponseObj: null,
    };
    const normalized = normalizeApiBody(raw);
    expect(normalized.errorObj?.[0]?.errorCode).toBe(401);
    expect(normalized.errorObj?.[0]?.errorMessage).toBe("Invalid User");
    expect(firstApiError(normalized)).toBe("Invalid User");
    expect(isApiSuccess(normalized)).toBe(false);
  });

  test("extracts ASP.NET ValidationProblemDetails errors into errorObj", () => {
    const rfcProblem = {
      type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
      title: "One or more validation errors occurred.",
      status: 400,
      errors: {
        NewPassword: [
          "Password must be at least 8 characters and include a letter and a number.",
        ],
      },
    };
    const normalized = normalizeApiBody(rfcProblem);
    expect(normalized.errorObj?.length).toBe(1);
    expect(normalized.errorObj?.[0]?.errorCode).toBe(400);
    expect(normalized.errorObj?.[0]?.errorMessage).toBe(
      "Password must be at least 8 characters and include a letter and a number.",
    );
    expect(firstApiError(normalized)).toBe(
      "Password must be at least 8 characters and include a letter and a number.",
    );
    expect(isApiSuccess(normalized)).toBe(false);
  });

  test("recognizes no-records code as success", () => {
    const noRecords = {
      errorObj: [
        { errorCode: API_ERROR_NO_RECORDS, errorMessage: "No records found" },
      ],
      responseObj: [],
    };
    const normalized = normalizeApiBody(noRecords);
    expect(isNoRecordsResponse(normalized)).toBe(true);
    expect(isApiSuccess(normalized)).toBe(true);
  });
});
