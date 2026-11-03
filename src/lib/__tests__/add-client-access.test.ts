import { describe, expect, test } from "bun:test";

import { resolveAddClientAccess } from "@/lib/add-client-access";

describe("resolveAddClientAccess", () => {
  test("opens wizard when subscription flag is off", () => {
    expect(resolveAddClientAccess(false, false)).toBe("wizard");
    expect(resolveAddClientAccess(false, true)).toBe("wizard");
  });

  test("paywall only when subscription on and coach unpaid", () => {
    expect(resolveAddClientAccess(true, false)).toBe("paywall");
    expect(resolveAddClientAccess(true, true)).toBe("wizard");
  });
});
