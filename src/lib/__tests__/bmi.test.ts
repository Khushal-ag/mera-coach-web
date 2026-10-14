import { describe, expect, test } from "bun:test";

import {
  formatBmi,
  getBmi,
  getBmiCategory,
  resolveDisplayBmi,
} from "@/lib/bmi";

describe("bmi", () => {
  test("computes from height and weight, null on bad input", () => {
    expect(formatBmi(getBmi(162, 58)!)).toBe("22.1");
    expect(getBmi("", "")).toBeNull();
    expect(getBmi(0, 60)).toBeNull();
    expect(getBmi("abc", 60)).toBeNull();
  });
  test("category boundaries", () => {
    expect(getBmiCategory(18.4)?.label).toBe("Underweight");
    expect(getBmiCategory(18.5)?.label).toBe("Normal");
    expect(getBmiCategory(25)?.label).toBe("Overweight");
    expect(getBmiCategory(30)?.label).toBe("Obese");
    expect(getBmiCategory(null)).toBeNull();
    expect(getBmiCategory(Number.NaN)).toBeNull();
  });
  test("display bmi prefers the API value, falls back when it is 0", () => {
    expect(resolveDisplayBmi({ bmi: 24.2, height: 170, weight: 70 })).toBe(
      24.2,
    );
    const fallback = resolveDisplayBmi({ bmi: 0, height: 170, weight: 70 });
    expect(formatBmi(fallback!)).toBe("24.2");
    expect(resolveDisplayBmi({ bmi: 0 })).toBeNull();
    expect(resolveDisplayBmi(null)).toBeNull();
  });
});
