import { beforeEach, describe, expect, it, mock } from "bun:test";

const saved: Record<string, unknown>[] = [];
mock.module("@/lib/api/practice", () => ({
  saveCoachProfileEssentials: async (params: Record<string, unknown>) => {
    saved.push(params);
  },
}));
mock.module("@/lib/api/master", () => ({
  fetchLocationByPin: async () => ({
    city: "Pune",
    state: "Maharashtra",
    country: "IN",
  }),
}));

const { autoFillProfileLocation } = await import("../current-place");

const store = new Map<string, string>();
const g = globalThis as Record<string, unknown>;
g.sessionStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
};

function stubBrowser(granted: boolean) {
  g.navigator = {
    geolocation: {
      getCurrentPosition: (
        ok: (p: unknown) => void,
        fail: (e: unknown) => void,
      ) =>
        granted ?
          ok({ coords: { latitude: 18.5, longitude: 73.9 } })
        : fail({ code: 1, PERMISSION_DENIED: 1 }),
    },
  };
  g.fetch = async () => ({
    ok: true,
    json: async () => ({
      address: {
        postcode: "411037",
        suburb: "Market Yard",
        road: "Satara Road",
      },
    }),
  });
}

const profile = {
  coachId: 3,
  coachCode: "abc",
  coachName: "Test Coach",
  email: "t@example.com",
  mobile: "9000000000",
  pinCode: null,
  locality: null,
  add_Line: null,
  city_Cd: null,
  state_Cd: null,
  country_Cd: null,
} as never;

describe("autoFillProfileLocation", () => {
  beforeEach(() => {
    store.clear();
    saved.length = 0;
  });

  it("saves the detected address when the pin code is empty", async () => {
    stubBrowser(true);
    expect(await autoFillProfileLocation(profile)).toBe(true);
    expect(saved[0]).toMatchObject({
      pinCode: "411037",
      locality: "Market Yard",
      add_Line: "Satara Road",
      city_Cd: "Pune",
      state_Cd: "Maharashtra",
      country_Cd: "IN",
    });
  });

  it("does nothing when a pin code already exists", async () => {
    stubBrowser(true);
    expect(
      await autoFillProfileLocation({
        ...(profile as object),
        pinCode: "281001",
      } as never),
    ).toBe(false);
    expect(saved).toHaveLength(0);
  });

  it("asks once per session and stays silent when permission is denied", async () => {
    stubBrowser(false);
    expect(await autoFillProfileLocation(profile)).toBe(false);
    stubBrowser(true);
    expect(await autoFillProfileLocation(profile)).toBe(false);
    expect(saved).toHaveLength(0);
  });
});
