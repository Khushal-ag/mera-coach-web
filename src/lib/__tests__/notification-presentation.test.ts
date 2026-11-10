import { describe, expect, it } from "bun:test";

import { actionLabel, splitBody } from "@/lib/notification-presentation";

describe("splitBody", () => {
  it("puts what happened first and what to do after it", () => {
    expect(
      splitBody(
        "Hi Khushal, you haven't requested feedback from Priya Sharma yet. Ask them about their coaching experience to understand how you can improve.",
      ),
    ).toEqual({
      lead: "Hi Khushal, you haven't requested feedback from Priya Sharma yet.",
      rest: "Ask them about their coaching experience to understand how you can improve.",
    });
  });

  it("keeps a short greeting together with the sentence after it", () => {
    expect(
      splitBody(
        "Great news, Asha! Rohan has shared feedback about your coaching. Read it now.",
      ),
    ).toEqual({
      lead: "Great news, Asha! Rohan has shared feedback about your coaching.",
      rest: "Read it now.",
    });
  });

  it("returns the whole text as the lead when it is one sentence or has no full stop", () => {
    expect(splitBody("Your plan ends tomorrow, so renew it today.")).toEqual({
      lead: "Your plan ends tomorrow, so renew it today.",
      rest: "",
    });
    expect(splitBody("No full stop here at all")).toEqual({
      lead: "No full stop here at all",
      rest: "",
    });
    expect(splitBody("   ")).toEqual({ lead: "", rest: "" });
  });
});

describe("actionLabel", () => {
  it("names the action for each alert type", () => {
    expect(actionLabel("FEEDBACK_NONE", "client")).toBe("Request feedback");
    expect(actionLabel("GALLERY_NONE", "posts")).toBe("Upload photos");
  });

  it("falls back to the screen the alert opens, then to a plain Open", () => {
    expect(actionLabel("SOMETHING_NEW", "packages")).toBe("Open packages");
    expect(actionLabel("SOMETHING_NEW", "unknown")).toBe("Open");
  });
});
