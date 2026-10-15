import { describe, expect, test } from "bun:test";

import { describeValidity } from "@/lib/validity";

const today = new Date(2026, 9, 15); // 15 Oct 2026

describe("describeValidity", () => {
  test("reads yyyy-MM-dd and dd/MM/yyyy", () => {
    expect(describeValidity("2027-10-15", today)?.dateLabel).toBe(
      "15 Oct 2027",
    );
    expect(describeValidity("15/03/2027", today)?.dateLabel).toBe(
      "15 Mar 2027",
    );
  });
  test("ok far from the end, soon in the last 15 days, expired after", () => {
    expect(describeValidity("2027-10-15", today)?.tone).toBe("ok");
    expect(describeValidity("2026-10-30", today)).toMatchObject({
      tone: "soon",
      daysLeft: 15,
    });
    expect(describeValidity("2026-10-15", today)).toMatchObject({
      tone: "soon",
      daysLeft: 0,
    });
    expect(describeValidity("2026-10-14", today)).toMatchObject({
      tone: "expired",
      daysLeft: -1,
    });
  });
  test("null for empty or invalid", () => {
    expect(describeValidity("", today)).toBeNull();
    expect(describeValidity(undefined, today)).toBeNull();
    expect(describeValidity("31/02/2027", today)).toBeNull();
    expect(describeValidity("active", today)).toBeNull();
  });
});
