import { describe, expect, test } from "bun:test";

import {
  friendlyPdfError,
  isPdfHostUnavailableError,
  PDF_HOST_UNAVAILABLE_MESSAGE,
} from "@/lib/api/pdf";

describe("PDF host errors", () => {
  test("detects API soft-fail message", () => {
    expect(
      isPdfHostUnavailableError(
        "PDF export is not available on this host. Open the HTML report and use Print instead.",
      ),
    ).toBe(true);
  });

  test("maps to coach-friendly info copy", () => {
    expect(
      friendlyPdfError(
        "PDF export is not available on this host. Open the HTML report and use Print instead.",
      ),
    ).toEqual({ tone: "info", text: PDF_HOST_UNAVAILABLE_MESSAGE });
  });
});
