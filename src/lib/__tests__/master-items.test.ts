import { describe, expect, it } from "bun:test";

import { normalizeMasterItems } from "@/lib/api/master";

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
