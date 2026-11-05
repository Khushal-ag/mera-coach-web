import { describe, expect, it } from "bun:test";

import {
  getPackagesEmptyStateCopy,
  shouldShowPackagesSubtitle,
} from "../packages-list-ui";

describe("packages-list-ui", () => {
  it("hides description until brand is set or packages exist", () => {
    expect(shouldShowPackagesSubtitle(false, 0)).toBe(false);
    expect(shouldShowPackagesSubtitle(true, 0)).toBe(true);
  });

  it("returns professional-details CTA when brand is missing", () => {
    const copy = getPackagesEmptyStateCopy(false, "");
    expect(copy.actionLabel).toBe("Go to Professional details");
  });
});
