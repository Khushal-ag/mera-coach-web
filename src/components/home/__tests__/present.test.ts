import { describe, expect, test } from "bun:test";

import { coachTypeStyle } from "@/components/home/present";
import { BRAND_COLORS } from "@/constants/home";
import { COACH_BANNERS, unsplash } from "@/constants/images";

describe("coachTypeStyle", () => {
  test("picks the row whose word is in the coach type", () => {
    expect(coachTypeStyle("Yoga Coach").color).toBe(BRAND_COLORS.goldDark);
    expect(coachTypeStyle("Nutritionist").banner).toBe(
      unsplash(COACH_BANNERS.nutrition[0]),
    );
  });

  test("matches on any case", () => {
    expect(coachTypeStyle("PERSONAL TRAINER").color).toBe(BRAND_COLORS.primary);
  });

  test("the first matching row wins", () => {
    // "fitness" (first row) beats "health" (last row).
    expect(coachTypeStyle("Health and Fitness Coach").color).toBe(
      BRAND_COLORS.primary,
    );
  });

  test("uses the three banners of a row in turn", () => {
    const banners = [0, 1, 2, 3].map(
      (index) => coachTypeStyle("Yoga", index).banner,
    );
    expect(banners[0]).toBe(unsplash(COACH_BANNERS.yoga[0]));
    expect(banners[1]).toBe(unsplash(COACH_BANNERS.yoga[1]));
    expect(banners[2]).toBe(unsplash(COACH_BANNERS.yoga[2]));
    expect(banners[3]).toBe(banners[0]);
  });

  test("falls back to the default banners for an unknown type", () => {
    const style = coachTypeStyle("Something else");
    expect(style.color).toBe(BRAND_COLORS.forestDeep);
    expect(style.banner).toBe(unsplash(COACH_BANNERS.fallback[0]));
  });
});
