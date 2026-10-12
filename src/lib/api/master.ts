import type { GenericResponse } from "@/lib/api/types";

import { apiFetch } from "@/lib/api/client";
import { pick } from "@/lib/api/normalize";

export type MasterOption = {
  code: string;
  label: string;
};

function normalizeMasterItems(payload: unknown): MasterOption[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      const code = String(
        pick(r, "itemCode", "ItemCode", "code", "Code") ?? "",
      ).trim();
      const label = String(
        pick(r, "itemName", "ItemName", "label", "Label", "name", "Name") ?? "",
      ).trim();
      if (!code || !label) return null;
      return { code, label } satisfies MasterOption;
    })
    .filter((x): x is MasterOption => x != null);
}

/** Anonymous master list — same endpoint the app uses for CoachType. */
async function fetchMasterItems(params: {
  ItemType?: string;
  itemType?: string;
  filterText?: string;
}): Promise<GenericResponse<MasterOption[]>> {
  const query = new URLSearchParams();
  if (params.ItemType) query.set("ItemType", params.ItemType);
  if (params.itemType) query.set("itemType", params.itemType);
  if (params.filterText) query.set("filterText", params.filterText);
  const response = await apiFetch<unknown>(
    `/v1/Master/GetMasterItem?${query}`,
    { next: { revalidate: 3600 }, skipAuth: true },
  );
  return {
    ...response,
    responseObj: normalizeMasterItems(response.responseObj),
  };
}

export async function fetchCoachCategories(): Promise<MasterOption[]> {
  try {
    const res = await fetchMasterItems({ ItemType: "CoachType" });
    return res.responseObj ?? [];
  } catch {
    return [];
  }
}

/** Services for a coach category — same filter as app `getServicesForCategory`. */
export async function fetchServicesForCategory(
  categoryCode: string,
): Promise<MasterOption[]> {
  const code = categoryCode.trim();
  if (!code) return [];
  try {
    // Service filter uses lowercase itemType (CoachType uses ItemType).
    const res = await fetchMasterItems({
      itemType: "Service",
      filterText: code,
    });
    return res.responseObj ?? [];
  } catch {
    return [];
  }
}

export type LocationByPin = {
  pinCode: string;
  city: string;
  state: string;
  country: string;
};

function normalizeLocation(raw: unknown): LocationByPin | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    pinCode: String(pick(r, "pinCode", "PinCode") ?? "").trim(),
    city: String(pick(r, "city", "City") ?? "").trim(),
    state: String(pick(r, "state", "State") ?? "").trim(),
    country: String(pick(r, "country", "Country") ?? "").trim(),
  };
}

/** PIN → city/state (zippopotam via API). Default country IN. */
export async function fetchLocationByPin(params: {
  pinCode: string;
  countryCode?: string;
}): Promise<LocationByPin | null> {
  const pinCode = params.pinCode.trim();
  const countryCode = (params.countryCode ?? "IN").trim() || "IN";
  if (!pinCode) return null;
  const query = new URLSearchParams({ countryCode, pinCode });
  const response = await apiFetch<unknown>(
    `/v1/Master/GetLocationByPin?${query}`,
    { skipAuth: true },
  );
  return normalizeLocation(response.responseObj);
}
