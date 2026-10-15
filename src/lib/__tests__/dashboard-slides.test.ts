import { describe, expect, test } from "bun:test";

import type { SlideInput } from "@/components/practice/dashboard-slides";

import { buildDashboardSlides } from "@/components/practice/dashboard-slides";

const base: SlideInput = {
  ready: true,
  completion: 100,
  missing: [],
  clientCount: 3,
  openLeadCount: 0,
  dueCount: 0,
  packageCount: 2,
  eventCount: 1,
  validity: { dateLabel: "1 Jan 2030", tone: "ok", daysLeft: 400 },
  profileHref: "/coach/abc",
};

const ids = (input: Partial<SlideInput>) =>
  buildDashboardSlides({ ...base, ...input }).map((slide) => slide.id);

describe("buildDashboardSlides", () => {
  test("nothing until data has loaded", () => {
    expect(ids({ ready: false })).toEqual([]);
    expect(ids({ completion: null })).toEqual([]);
  });

  test("a finished profile has no profile card but keeps several tips", () => {
    const list = ids({});
    expect(list).not.toContain("profile");
    expect(list.length).toBeGreaterThan(2);
  });

  test("an incomplete profile shows its progress first among guidance", () => {
    const [first] = buildDashboardSlides({
      ...base,
      completion: 60,
      missing: ["Profile photo"],
    });
    expect(first?.id).toBe("profile");
    expect(first?.ring).toBe(60);
  });

  test("new coaches are asked to add a first client", () => {
    expect(ids({ clientCount: 0 })).toContain("first-client");
    expect(ids({ clientCount: 0 })).not.toContain("diet");
  });

  test("waiting enquiries and due check-ups are surfaced", () => {
    expect(ids({ openLeadCount: 2 })).toContain("leads");
    expect(ids({ dueCount: 1 })).toContain("due");
  });

  test("never more than the configured maximum", () => {
    const list = ids({
      completion: 40,
      missing: ["x"],
      openLeadCount: 1,
      dueCount: 1,
      packageCount: 0,
      eventCount: 0,
    });
    expect(list.length).toBeLessThanOrEqual(6);
  });
});
