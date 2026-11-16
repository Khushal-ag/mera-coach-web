import type { GenericResponse } from "@/lib/api/types";

import { PARAM_WIRE_CODE_LABELS } from "@/constants/lifestyle-options";
import { apiFetch } from "@/lib/api/client";
import { pick } from "@/lib/api/normalize";

export type MasterOption = {
  code: string;
  label: string;
  iconClass?: string;
  description?: string;
  /** False for a category that is not live yet. Only sent when the list is asked for with `includeInactive`. */
  isActive?: boolean;
};

/** Everything except an explicitly inactive row counts as live. */
export function isLiveOption(option: MasterOption) {
  return option.isActive !== false;
}

/** Master rows from the API; exported for tests. */
export function normalizeMasterItems(payload: unknown): MasterOption[] {
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
      const iconClass = String(
        pick(r, "iconClass", "IconClass", "icon", "Icon") ?? "",
      ).trim();
      const description = String(
        pick(r, "description", "Description") ?? "",
      ).trim();
      const isActive = pick(r, "isActive", "IsActive");
      return {
        code,
        label,
        ...(iconClass ? { iconClass } : {}),
        ...(description ? { description } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      } satisfies MasterOption;
    })
    .filter((x): x is MasterOption => x != null);
}

/** Anonymous master list: same endpoint the app uses for CoachType. */
export async function fetchMasterItems(params: {
  ItemType?: string;
  itemType?: string;
  filterText?: string;
  ParamCode?: string;
  /** Coach types only: also return the categories that are not live yet. */
  includeInactive?: boolean;
}): Promise<GenericResponse<MasterOption[]>> {
  const query = new URLSearchParams();
  if (params.ParamCode) query.set("ParamCode", params.ParamCode);
  if (params.ItemType) query.set("ItemType", params.ItemType);
  if (params.itemType) query.set("itemType", params.itemType);
  if (params.filterText) query.set("filterText", params.filterText);
  if (params.includeInactive) query.set("includeInactive", "true");
  const response = await apiFetch<unknown>(`/Master/GetMasterItem?${query}`, {
    next: { revalidate: 3600 },
    skipAuth: true,
  });
  return {
    ...response,
    responseObj: normalizeMasterItems(response.responseObj),
  };
}

export async function fetchMasterOptions(
  itemType: string,
  filterText?: string,
): Promise<MasterOption[]> {
  const type = itemType.trim();
  if (!type) return [];
  try {
    const res = await fetchMasterItems({
      itemType: type,
      ...(filterText ? { filterText } : {}),
    });
    return res.responseObj ?? [];
  } catch {
    return [];
  }
}

/** PARAMLIST dropdowns (PC001–PC010). The app saves `itemCode`; the UI shows the label. */
export async function fetchParamList(
  paramCode: string,
): Promise<MasterOption[]> {
  try {
    const res = await fetchMasterItems({
      ItemType: "PARAMLIST",
      ParamCode: paramCode,
    });
    return res.responseObj ?? [];
  } catch {
    return [];
  }
}

/** Label or code in, code out. Unknown values pass through unchanged. */
export function resolveParamCode(
  value: string | undefined | null,
  options: MasterOption[],
): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  const hit = options.find((o) => o.code === v || o.label === v);
  return hit ? hit.code : v;
}

const MASTER_ITEM_CODE = /^[A-Za-z]{2,4}\d{2,}$/;

function findParamOption(
  value: string,
  options: MasterOption[],
): MasterOption | undefined {
  const lower = value.toLowerCase();
  return options.find(
    (o) =>
      o.code === value ||
      o.label === value ||
      o.code.toLowerCase() === lower ||
      o.label.toLowerCase() === lower,
  );
}

/** Code or label in, label out. Unknown master item codes resolve to empty. */
export function resolveParamLabel(
  value: string | undefined | null,
  options: MasterOption[],
): string {
  const v = (value ?? "").trim();
  if (!v) return "";

  const wireLabel = PARAM_WIRE_CODE_LABELS[v.toUpperCase()];
  if (wireLabel) return wireLabel;

  const hit = findParamOption(v, options);
  if (hit) return hit.label;

  if (MASTER_ITEM_CODE.test(v)) return "";

  return v;
}

/** Comma-separated codes or labels in, human-readable list out. */
export function resolveParamLabels(
  value: string | undefined | null,
  options: MasterOption[],
): string {
  return (value ?? "")
    .split(",")
    .map((part) => resolveParamLabel(part, options))
    .filter(Boolean)
    .join(", ");
}

/** The live categories. With `includeInactive`, the ones that are not live yet come too, flagged `isActive: false`. */
export async function fetchCoachCategories({
  includeInactive = false,
}: { includeInactive?: boolean } = {}): Promise<MasterOption[]> {
  try {
    const res = await fetchMasterItems({
      ItemType: "CoachType",
      includeInactive,
    });
    return res.responseObj ?? [];
  } catch {
    return [];
  }
}

/** Services for a coach category: same filter as app `getServicesForCategory`. */
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

type LocationByPin = {
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
    `/Master/GetLocationByPin?${query}`,
    { skipAuth: true },
  );
  return normalizeLocation(response.responseObj);
}

export type FoodMasterItem = {
  id: string;
  name: string;
  cal: number;
  cat: string;
};

/** Foods per meal slot, keyed by the API slot label (for example "Early Morning"). */
export type FoodMaster = Record<string, FoodMasterItem[]>;

export async function fetchFoodMaster(
  country: string,
  region: string,
): Promise<FoodMaster> {
  try {
    const query = new URLSearchParams({ country, region });
    const res = await apiFetch<FoodMaster>(`/Master/food-master?${query}`, {
      next: { revalidate: 3600 },
      skipAuth: true,
    });
    return res.responseObj ?? {};
  } catch {
    return {};
  }
}

/** Looks up calories for a food that is not in the master list. */
export async function fetchFoodCalories(
  foodName: string,
  qty = 1,
): Promise<number> {
  const res = await apiFetch<{ cal?: number }>("/Master/food-calories", {
    method: "POST",
    body: JSON.stringify({ foodName, qty }),
    skipAuth: true,
  });
  return res.responseObj?.cal ?? 0;
}
