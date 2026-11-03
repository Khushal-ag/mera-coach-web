import { describe, expect, test } from "bun:test";

import {
  firstItemOverMrp,
  itemAmountOverMrp,
  packageTotalOverMrp,
  roundRupee,
  sumItemMrp,
} from "@/lib/package-validation";

describe("package-validation", () => {
  test("compares amounts at two decimal places", () => {
    expect(itemAmountOverMrp(100.001, 100)).toBe(false);
    expect(itemAmountOverMrp(100.01, 100)).toBe(true);
    expect(roundRupee(10.005)).toBe(10.01);
  });

  test("flags package total above combined MRP", () => {
    expect(packageTotalOverMrp(500, 500)).toBe(false);
    expect(packageTotalOverMrp(500.01, 500)).toBe(true);
  });

  test("finds the first item over its product MRP", () => {
    const mrp = new Map([
      ["A", 100],
      ["B", 200],
    ]);
    const over = firstItemOverMrp(
      [
        { itemCode: "A", itemName: "Alpha", amount: 100 },
        { itemCode: "B", itemName: "Beta", amount: 250 },
      ],
      mrp,
    );
    expect(over).toEqual({ itemName: "Beta", mrp: 200 });
    expect(
      sumItemMrp(
        [
          { itemCode: "A", itemName: "Alpha", amount: 50 },
          { itemCode: "B", itemName: "Beta", amount: 50 },
        ],
        mrp,
      ),
    ).toBe(300);
  });
});
