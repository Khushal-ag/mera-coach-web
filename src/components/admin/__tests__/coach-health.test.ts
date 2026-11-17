import { describe, expect, it } from "bun:test";

import type { CoachStatsRow } from "@/lib/api/admin";

import {
  assessCoach,
  EXPIRING_SOON_DAYS,
  truthyFlag,
} from "@/components/admin/coach-health";

const NOW = Date.parse("2026-11-16T12:00:00Z");
const DAY = 86_400_000;

function row(over: Partial<CoachStatsRow> = {}): CoachStatsRow {
  return {
    coachCode: "abc123",
    coachName: "Test Coach",
    email: "coach@example.com",
    mobile: "9000000000",
    registeredOn: "2026-08-29T03:05:14.257",
    emailVerified: "Y",
    isProfileVisible: 1,
    validUpto: new Date(NOW + 200 * DAY).toISOString(),
    validityExpired: "",
    clients: 1,
    checkups: 0,
    leads: 0,
    packageCount: 0,
    coachEvent: 0,
    ...over,
  };
}

describe("truthyFlag", () => {
  it("reads the stats procedure's Y / N", () => {
    expect(truthyFlag("Y")).toBe(true);
    expect(truthyFlag("N")).toBe(false);
    expect(truthyFlag("")).toBe(false);
  });
});

describe("assessCoach", () => {
  it("is live when visible and the plan has time left", () => {
    const h = assessCoach(row(), NOW);
    expect(h.live).toBe(true);
    expect(h.expired || h.expiringSoon || h.hidden || h.inactive).toBe(false);
  });

  it("flags a plan ending within the warning window", () => {
    const h = assessCoach(
      row({
        validUpto: new Date(NOW + (EXPIRING_SOON_DAYS - 1) * DAY).toISOString(),
      }),
      NOW,
    );
    expect(h.expiringSoon).toBe(true);
    expect(h.live).toBe(true);
  });

  it("flags an ended plan as expired and not live", () => {
    const h = assessCoach(
      row({ validUpto: new Date(NOW - 3 * DAY).toISOString() }),
      NOW,
    );
    expect(h.expired).toBe(true);
    expect(h.live).toBe(false);
    expect(h.expiringSoon).toBe(false);
  });

  it("flags hidden, unverified and inactive coaches", () => {
    const h = assessCoach(
      row({ isProfileVisible: 0, emailVerified: "N", clients: 0 }),
      NOW,
    );
    expect(h.hidden && h.unverified && h.inactive).toBe(true);
    expect(h.live).toBe(false);
  });
});
