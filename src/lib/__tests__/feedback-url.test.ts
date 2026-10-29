import { describe, expect, it } from "bun:test";

import { decodeFeedbackToken, encodeFeedbackToken } from "../feedback-crypto";
import { buildFeedbackWebUrl } from "../feedback-url";

describe("feedback crypto and url", () => {
  it("encodes and decodes coach and client codes", () => {
    const token = encodeFeedbackToken("CCH_007", "CLI_999");
    expect(token).toBeTruthy();
    expect(token).not.toContain("CCH_007");
    expect(token).not.toContain("CLI_999");

    const decoded = decodeFeedbackToken(token);
    expect(decoded).toEqual({
      coachCode: "CCH_007",
      clientCode: "CLI_999",
    });
  });

  it("returns null for tampered or invalid tokens", () => {
    expect(decodeFeedbackToken("")).toBeNull();
    expect(decodeFeedbackToken("invalid-token-here")).toBeNull();

    const valid = encodeFeedbackToken("COACH", "CLIENT");
    const tampered = valid.slice(0, -4) + "AAAA";
    expect(decodeFeedbackToken(tampered)).toBeNull();
  });

  it("builds feedback url using encrypted ref parameter", () => {
    const url = buildFeedbackWebUrl({
      coachCode: "COACH_1",
      clientCode: "CLIENT_2",
      siteUrl: "https://mera-coach.com",
    });
    expect(url).toBeTruthy();
    expect(url).toContain("https://mera-coach.com/feedback?ref=");
    expect(url).not.toContain("COACH_1");
    expect(url).not.toContain("CLIENT_2");

    const parsed = new URL(url!);
    const ref = parsed.searchParams.get("ref");
    expect(ref).toBeTruthy();
    expect(decodeFeedbackToken(ref!)).toEqual({
      coachCode: "COACH_1",
      clientCode: "CLIENT_2",
    });
  });
});
