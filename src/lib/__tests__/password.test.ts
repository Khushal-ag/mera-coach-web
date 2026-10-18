import { describe, expect, test } from "bun:test";

import { PASSWORD_RULE, passwordPolicyError } from "../password";

describe("passwordPolicyError", () => {
  test("accepts 8 or more characters with a letter and a number", () => {
    expect(passwordPolicyError("Strong123")).toBeNull();
    expect(passwordPolicyError("abc12345")).toBeNull();
  });

  test("rejects short, letters-only and numbers-only passwords", () => {
    expect(passwordPolicyError("short1")).toBe(PASSWORD_RULE);
    expect(passwordPolicyError("onlyletters")).toBe(PASSWORD_RULE);
    expect(passwordPolicyError("12345678")).toBe(PASSWORD_RULE);
    expect(passwordPolicyError("")).toBe(PASSWORD_RULE);
  });

  test("rejects very long passwords", () => {
    expect(passwordPolicyError("a1".repeat(60))).toBe("Password is too long.");
  });
});
