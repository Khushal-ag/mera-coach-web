import { describe, expect, it } from "bun:test";

import { splitPackDetail } from "@/lib/coach/pack-detail";

describe("splitPackDetail", () => {
  it("splits the pack size off the product name", () => {
    expect(splitPackDetail("Afresh Energy Drink Mix - Elaichi-50 gms")).toEqual(
      { name: "Afresh Energy Drink Mix - Elaichi", pack: "50 gms" },
    );
    expect(
      splitPackDetail(
        "Formula 1- Nutritional Shake Mix - Banana Caramel -500 Gms",
      ),
    ).toEqual({
      name: "Formula 1- Nutritional Shake Mix - Banana Caramel",
      pack: "500 Gms",
    });
  });

  it("leaves a name without a pack size alone", () => {
    expect(splitPackDetail("Formula 1 Shake Mix")).toEqual({
      name: "Formula 1 Shake Mix",
      pack: "",
    });
    expect(splitPackDetail("500 gms")).toEqual({ name: "500 gms", pack: "" });
  });
});
