import { describe, expect, it } from "bun:test";

import { parseNominatimPlace } from "../current-place";

describe("parseNominatimPlace", () => {
  it("reads pin code, locality and street", () => {
    expect(
      parseNominatimPlace({
        address: {
          postcode: "281 001",
          suburb: "Krishna Nagar",
          house_number: "12",
          road: "Station Road",
        },
      }),
    ).toEqual({
      pinCode: "281001",
      locality: "Krishna Nagar",
      addLine: "12 Station Road",
    });
  });

  it("leaves the pin empty for a bad code and tolerates an empty answer", () => {
    expect(parseNominatimPlace({ address: { postcode: "2810" } }).pinCode).toBe(
      "",
    );
    expect(parseNominatimPlace(null)).toEqual({
      pinCode: "",
      locality: "",
      addLine: "",
    });
  });
});
