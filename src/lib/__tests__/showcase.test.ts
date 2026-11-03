import { describe, expect, test } from "bun:test";

import { mapProductItemOption, productBrandLabel } from "../api/showcase";

describe("productBrandLabel", () => {
  test("returns label from master list", () => {
    expect(
      productBrandLabel(
        [
          { code: "HERBALIFE", label: "Herbalife" },
          { code: "AMWAY", label: "Amway" },
        ],
        "AMWAY",
      ),
    ).toBe("Amway");
  });

  test("falls back to code when brand is unknown", () => {
    expect(productBrandLabel([], "VESTIGE")).toBe("VESTIGE");
  });
});

describe("mapProductItemOption", () => {
  test("reads camelCase product fields", () => {
    expect(
      mapProductItemOption(
        {
          itemCode: "P1",
          itemName: "Shake",
          price: 1200,
          category: "Nutrition",
          packSize: "500g",
        },
        "HERBALIFE",
      ),
    ).toEqual({
      code: "P1",
      label: "Shake",
      brandCode: "HERBALIFE",
      price: 1200,
      category: "Nutrition",
      packSize: "500g",
    });
  });

  test("reads PascalCase ASP.NET product fields", () => {
    expect(
      mapProductItemOption(
        {
          ItemCode: "V2",
          ItemName: "Protein",
          Price: 999,
          Category: "Weight management",
          PackSize: "1 kg",
        },
        "VESTIGE",
      ),
    ).toEqual({
      code: "V2",
      label: "Protein",
      brandCode: "VESTIGE",
      price: 999,
      category: "Weight management",
      packSize: "1 kg",
    });
  });
});
