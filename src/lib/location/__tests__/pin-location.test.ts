import { describe, expect, it } from "bun:test";

import {
  mapPinLookupToFields,
  resolveCountryCodeForPinLookup,
} from "../pin-location";

describe("resolveCountryCodeForPinLookup", () => {
  it("maps India name to IN", () => {
    expect(
      resolveCountryCodeForPinLookup({
        apiCountry: "India",
        pinCode: "560001",
      }),
    ).toBe("IN");
  });

  it("passes through two-letter codes", () => {
    expect(resolveCountryCodeForPinLookup({ apiCountry: "us" })).toBe("US");
  });

  it("falls back to lookup country code when API omits country", () => {
    expect(
      resolveCountryCodeForPinLookup({
        lookupCountryCode: "IN",
        pinCode: "560001",
      }),
    ).toBe("IN");
  });

  it("defaults to IN for 6-digit PIN when nothing else is known", () => {
    expect(resolveCountryCodeForPinLookup({ pinCode: "400001" })).toBe("IN");
  });
});

describe("mapPinLookupToFields", () => {
  it("includes resolved country with city and state", () => {
    expect(
      mapPinLookupToFields(
        { city: "Pune", state: "Maharashtra", country: "India" },
        "IN",
        "411037",
      ),
    ).toEqual({
      city: "Pune",
      state: "Maharashtra",
      countryCode: "IN",
    });
  });

  it("infers IN when API returns city/state only", () => {
    expect(
      mapPinLookupToFields(
        { city: "Mumbai", state: "Maharashtra" },
        "",
        "400001",
      ),
    ).toEqual({
      city: "Mumbai",
      state: "Maharashtra",
      countryCode: "IN",
    });
  });
});
