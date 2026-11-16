import { describe, expect, it } from "bun:test";

import { isLiveOption, normalizeMasterItems } from "@/lib/api/master";

describe("normalizeMasterItems", () => {
  it("reads a category the way the API sends it, including its icon", () => {
    expect(
      normalizeMasterItems([
        {
          itemCode: "CT007",
          itemName: "Yoga Coach",
          icon: "fas fa-spa",
          description: "Yoga postures, breathing techniques and inner peace",
          sortOrder: 2,
        },
      ]),
    ).toEqual([
      {
        code: "CT007",
        label: "Yoga Coach",
        iconClass: "fas fa-spa",
        description: "Yoga postures, breathing techniques and inner peace",
      },
    ]);
  });

  it("still accepts iconClass and leaves out an empty icon or description", () => {
    expect(
      normalizeMasterItems([
        { itemCode: "CT001", itemName: "Health", iconClass: "fas fa-heart" },
        { itemCode: "CT002", itemName: "Diet", icon: "", description: "" },
      ]),
    ).toEqual([
      { code: "CT001", label: "Health", iconClass: "fas fa-heart" },
      { code: "CT002", label: "Diet" },
    ]);
  });

  it("skips rows without a code or a name and ignores a non-list payload", () => {
    expect(
      normalizeMasterItems([{ itemCode: "CT003" }, { itemName: "x" }]),
    ).toEqual([]);
    expect(normalizeMasterItems(null)).toEqual([]);
  });
});

describe("categories that are not live yet", () => {
  it("keeps the isActive flag the API sends when inactive rows are requested", () => {
    expect(
      normalizeMasterItems([
        { itemCode: "CT001", itemName: "Health", isActive: true },
        { itemCode: "CT007", itemName: "Yoga Coach", isActive: false },
      ]),
    ).toEqual([
      { code: "CT001", label: "Health", isActive: true },
      { code: "CT007", label: "Yoga Coach", isActive: false },
    ]);
  });

  it("treats a row without the flag as live, and only an explicit false as not live", () => {
    expect(isLiveOption({ code: "CT001", label: "Health" })).toBe(true);
    expect(
      isLiveOption({ code: "CT001", label: "Health", isActive: true }),
    ).toBe(true);
    expect(
      isLiveOption({ code: "CT007", label: "Yoga", isActive: false }),
    ).toBe(false);
  });

  it("ignores a flag that is not a true or false", () => {
    expect(
      normalizeMasterItems([
        { itemCode: "CT001", itemName: "Health", isActive: "no" },
      ]),
    ).toEqual([{ code: "CT001", label: "Health" }]);
  });
});
