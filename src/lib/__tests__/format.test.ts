import { describe, expect, test } from "bun:test";

import { genderLabel, initials } from "../format";
import { premiumHref } from "../premium-link";

describe("initials", () => {
  test("uses first and last word", () => {
    expect(initials("Khushal Agarwal")).toBe("KA");
    expect(initials("  Mary Ann  Smith ")).toBe("MS");
  });
  test("single word length is configurable", () => {
    expect(initials("Rekha")).toBe("R");
    expect(initials("Rekha", { singleWordLength: 2 })).toBe("RE");
  });
  test("falls back when there are no letters", () => {
    expect(initials("")).toBe("?");
    expect(initials(null, { fallback: "C" })).toBe("C");
    expect(initials("...", { fallback: "" })).toBe("");
  });
});

describe("genderLabel", () => {
  test("expands the API codes", () => {
    expect(genderLabel("M")).toBe("Male");
    expect(genderLabel("F")).toBe("Female");
    expect(genderLabel("Other")).toBe("Other");
    expect(genderLabel(undefined)).toBe("");
  });
});

describe("premiumHref", () => {
  test("carries coach details when known", () => {
    expect(premiumHref({ coachId: 7, coachCode: "abc" })).toBe(
      "/premium?coachId=7&coachCode=abc",
    );
  });
  test("is plain when nothing is known", () => {
    expect(premiumHref(null)).toBe("/premium");
    expect(premiumHref({ coachId: 0, coachCode: "" })).toBe("/premium");
  });
});
