import { describe, expect, test } from "bun:test";

import type { MasterOption } from "@/lib/api/master";

import { resolveParamLabel, resolveParamLabels } from "@/lib/api/master";

const medicalOptions: MasterOption[] = [
  { code: "NONE_OF_THE_BELOW", label: "None of the below" },
  { code: "LI0040", label: "Diabetes (Type 2)" },
];

describe("resolveParamLabel", () => {
  test("maps exclusive wire codes without master list", () => {
    expect(resolveParamLabel("NONE_OF_THE_BELOW", [])).toBe(
      "None of the below",
    );
    expect(resolveParamLabel("none_of_the_below", [])).toBe(
      "None of the below",
    );
  });

  test("maps master item codes to labels", () => {
    expect(resolveParamLabel("LI0040", medicalOptions)).toBe(
      "Diabetes (Type 2)",
    );
  });

  test("passes through saved labels from the web wizard", () => {
    expect(resolveParamLabel("Dairy / Lactose", [])).toBe("Dairy / Lactose");
  });

  test("hides unknown master item codes until options load", () => {
    expect(resolveParamLabel("LI9999", [])).toBe("");
  });
});

describe("resolveParamLabels", () => {
  test("joins comma-separated values", () => {
    expect(
      resolveParamLabels("NONE_OF_THE_BELOW, LI0040", medicalOptions),
    ).toBe("None of the below, Diabetes (Type 2)");
  });
});
