import { describe, expect, it } from "bun:test";

import { notificationHref, timeAgo } from "@/lib/notification-link";

describe("notificationHref", () => {
  it("maps each route to its dashboard page", () => {
    expect(notificationHref("leads", "12")).toBe("/dashboard/leads");
    expect(notificationHref("packages")).toBe("/dashboard/packages");
    expect(notificationHref("posts")).toBe("/dashboard/events");
    expect(notificationHref("reviews")).toBe("/dashboard/reviews");
    expect(notificationHref("premium")).toBe("/premium");
  });

  it("opens a client by code, or the client list without one", () => {
    expect(notificationHref("client", " CL00020 ")).toBe(
      "/dashboard/clients/CL00020",
    );
    expect(notificationHref("client", "")).toBe("/dashboard/clients");
    expect(notificationHref("client", "a/b")).toBe("/dashboard/clients/a%2Fb");
  });

  it("goes to the dashboard for a route it does not know", () => {
    expect(notificationHref("something-new")).toBe("/dashboard");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-11-05T10:00:00Z");

  it("uses short relative wording for recent alerts", () => {
    expect(timeAgo("2026-11-05T09:59:40Z", now)).toBe("Just now");
    expect(timeAgo("2026-11-05T09:55:00Z", now)).toBe("5 min ago");
    expect(timeAgo("2026-11-05T07:00:00Z", now)).toBe("3 h ago");
    expect(timeAgo("2026-11-04T08:00:00Z", now)).toBe("Yesterday");
    expect(timeAgo("2026-11-02T10:00:00Z", now)).toBe("3 days ago");
  });

  it("shows a date after a week and nothing for a bad value", () => {
    expect(timeAgo("2026-10-01T10:00:00Z", now)).toContain("2026");
    expect(timeAgo("not a date", now)).toBe("");
  });
});
