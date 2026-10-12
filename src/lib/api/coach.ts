import type { GenericResponse } from "@/lib/api/types";
import type {
  CoachEnquiryInput,
  CoachMediaUpdateInput,
  CoachProfile,
  CoachPublicListItem,
  CoachPublicPagedResult,
  CoachRegisterInput,
  CoachRegisterResult,
} from "@/types/coach";

import { apiFetch } from "@/lib/api/client";
import { pick } from "@/lib/api/normalize";
import { parseCoachEvents, pickEventsRaw } from "@/lib/coach/events";
import { parseCoachPackages, pickPackagesRaw } from "@/lib/coach/packages";
import { normalizeCoachMobile } from "@/lib/coach/whatsapp";

/** Map a public coach list payload whether nested keys are camel or Pascal. */
function normalizePublicList(payload: unknown): CoachPublicPagedResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const itemsRaw = (pick<unknown[]>(root, "items", "Items") ?? []) as unknown[];
  const items = itemsRaw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      coachId: Number(pick(r, "coachId", "CoachId") ?? 0),
      coachCode: String(pick(r, "coachCode", "CoachCode") ?? ""),
      urlFriendlyName: String(
        pick(r, "urlFriendlyName", "UrlFriendlyName") ?? "",
      ),
      coachName: String(pick(r, "coachName", "CoachName") ?? ""),
      coachTypeCode: String(pick(r, "coachTypeCode", "CoachTypeCode") ?? ""),
      coachTypeName: String(pick(r, "coachTypeName", "CoachTypeName") ?? ""),
      city_Cd: String(pick(r, "city_Cd", "City_Cd") ?? ""),
      state_Cd: String(pick(r, "state_Cd", "State_Cd") ?? ""),
      country_Cd: String(pick(r, "country_Cd", "Country_Cd") ?? ""),
      experienceYears: Number(
        pick(r, "experienceYears", "ExperienceYears") ?? 0,
      ),
      happyClientCount: Number(
        pick(r, "happyClientCount", "HappyClientCount") ?? 0,
      ),
      profile_Pic_Url: String(
        pick(r, "profile_Pic_Url", "Profile_Pic_Url") ?? "",
      ),
      tagline: String(pick(r, "tagline", "Tagline") ?? ""),
      coachDesc: String(pick(r, "coachDesc", "CoachDesc") ?? ""),
      serviceCodes_Csv: String(
        pick(r, "serviceCodes_Csv", "ServiceCodes_Csv") ?? "",
      ),
      serviceNames: String(pick(r, "serviceNames", "ServiceNames") ?? ""),
      rating: Number(pick(r, "rating", "Rating") ?? 0),
      reviewCount: Number(pick(r, "reviewCount", "ReviewCount") ?? 0),
      isProfileVisible: Boolean(
        pick(r, "isProfileVisible", "IsProfileVisible") ?? true,
      ),
    } satisfies CoachPublicListItem;
  });
  return {
    items,
    totalCount: Number(pick(root, "totalCount", "TotalCount") ?? items.length),
    page: Number(pick(root, "page", "Page") ?? 1),
    pageSize: Number(pick(root, "pageSize", "PageSize") ?? items.length),
    totalPages: Number(pick(root, "totalPages", "TotalPages") ?? 1),
  };
}

function normalizeProfile(payload: unknown): CoachProfile | null {
  if (!payload || typeof payload !== "object") return null;
  const r = payload as Record<string, unknown>;
  const packages = parseCoachPackages(pickPackagesRaw(r));
  const events = parseCoachEvents(pickEventsRaw(r));
  const mobileRaw = pick<string | number | null>(r, "mobile", "Mobile");
  const mobile = normalizeCoachMobile(mobileRaw) || null;
  return {
    coachId: Number(pick(r, "coachId", "CoachId") ?? 0),
    coachCode: String(pick(r, "coachCode", "CoachCode") ?? ""),
    coachName: String(pick(r, "coachName", "CoachName") ?? ""),
    businessName:
      pick<string | null>(r, "businessName", "BusinessName") ?? null,
    coachTypeCode:
      pick<string | null>(r, "coachTypeCode", "CoachTypeCode") ?? null,
    coachTypeName:
      pick<string | null>(r, "coachTypeName", "CoachTypeName") ?? null,
    city_Cd: pick<string | null>(r, "city_Cd", "City_Cd") ?? null,
    state_Cd: pick<string | null>(r, "state_Cd", "State_Cd") ?? null,
    country_Cd: pick<string | null>(r, "country_Cd", "Country_Cd") ?? null,
    locality: pick<string | null>(r, "locality", "Locality") ?? null,
    add_Line: pick<string | null>(r, "add_Line", "Add_Line") ?? null,
    tagline: pick<string | null>(r, "tagline", "Tagline") ?? null,
    coachDesc: pick<string | null>(r, "coachDesc", "CoachDesc") ?? null,
    profile_Pic_Url:
      pick<string | null>(r, "profile_Pic_Url", "Profile_Pic_Url") ?? null,
    logo_Url: pick<string | null>(r, "logo_Url", "Logo_Url") ?? null,
    serviceNames:
      pick<string | null>(r, "serviceNames", "ServiceNames") ?? null,
    experienceYears: Number(pick(r, "experienceYears", "ExperienceYears") ?? 0),
    happyClientCount: Number(
      pick(r, "happyClientCount", "HappyClientCount") ?? 0,
    ),
    certificationCount: Number(
      pick(r, "certificationCount", "CertificationCount") ?? 0,
    ),
    localLanguage:
      pick<string | null>(r, "localLanguage", "LocalLanguage") ?? null,
    rating: Number(pick(r, "rating", "Rating") ?? 0),
    reviewCount: Number(pick(r, "reviewCount", "ReviewCount") ?? 0),
    isProfileVisible: Boolean(
      pick(r, "isProfileVisible", "IsProfileVisible") ?? true,
    ),
    email: pick<string | null>(r, "email", "Email") ?? null,
    mobile,
    packages: packages.length ? packages : undefined,
    events: events.length ? events : undefined,
  };
}

export async function fetchPublicCoaches(params?: {
  search?: string;
  city?: string;
  coachTypeCode?: string;
  minRating?: number;
  /** Server sort: rating (default) | reviews | experience — same as app. */
  sortBy?: "rating" | "reviews" | "experience";
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.city) query.set("city", params.city);
  if (params?.coachTypeCode) query.set("coachTypeCode", params.coachTypeCode);
  if (params?.minRating != null)
    query.set("minRating", String(params.minRating));
  if (params?.sortBy && params.sortBy !== "rating")
    query.set("sortBy", params.sortBy);
  query.set("page", String(params?.page ?? 1));
  query.set("pageSize", String(params?.pageSize ?? 12));
  const response = await apiFetch<unknown>(`/v1/Coach/public?${query}`, {
    // Public directory. Anonymous so the response can be cached.
    next: { revalidate: 60 },
    skipAuth: true,
  });
  return {
    ...response,
    responseObj: normalizePublicList(response.responseObj),
  } satisfies GenericResponse<CoachPublicPagedResult>;
}

type BmiLeadInput = {
  clientName: string;
  clientMobile: string;
  gender?: string;
  age?: number | null;
  heightCm?: number;
  weightKg?: number;
  bmiValue?: number;
  bmiCategory?: string;
};

/** Public BMI lead capture — `POST /v1/Coach/bmi-lead` (same as app). */
export async function submitBmiLead(
  params: BmiLeadInput,
): Promise<GenericResponse<object>> {
  return apiFetch<object>("/v1/Coach/bmi-lead", {
    method: "POST",
    body: JSON.stringify({
      clientName: params.clientName,
      clientMobile: params.clientMobile,
      ...(params.gender ? { gender: params.gender } : {}),
      ...(params.age != null ? { age: params.age } : {}),
      ...(params.heightCm != null ? { heightCm: params.heightCm } : {}),
      ...(params.weightKg != null ? { weightKg: params.weightKg } : {}),
      ...(params.bmiValue != null && params.bmiValue > 0 ?
        { bmiValue: params.bmiValue }
      : {}),
      ...(params.bmiCategory ? { bmiCategory: params.bmiCategory } : {}),
    }),
    skipAuth: true,
  });
}

/** Distinct cities for Find-a-Coach filters. */
export async function fetchPublicCities(params?: {
  coachTypeCode?: string;
  country?: string;
  state?: string;
}) {
  const query = new URLSearchParams();
  if (params?.coachTypeCode) query.set("coachTypeCode", params.coachTypeCode);
  if (params?.country) query.set("country", params.country);
  if (params?.state) query.set("state", params.state);
  const qs = query.toString();
  const response = await apiFetch<unknown>(
    `/v1/Coach/public-cities${qs ? `?${qs}` : ""}`,
    { next: { revalidate: 300 }, skipAuth: true },
  );
  const raw = response.responseObj;
  let cities: string[] = [];
  if (Array.isArray(raw)) {
    cities = raw.map((item) => String(item)).filter(Boolean);
  } else if (raw && typeof raw === "object") {
    const root = raw as Record<string, unknown>;
    const list =
      pick<unknown[]>(root, "cities", "Cities", "items", "Items") ?? [];
    cities = list
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          return String(
            pick(row, "city", "City", "city_Cd", "City_Cd", "name", "Name") ??
              "",
          );
        }
        return "";
      })
      .filter(Boolean);
  }
  return { ...response, responseObj: cities };
}

export async function fetchCoachProfile(params: {
  coachId?: number;
  coachCode?: string;
}) {
  const query = new URLSearchParams();
  if (params.coachId && params.coachId > 0) {
    query.set("coachId", String(params.coachId));
  }
  if (params.coachCode) query.set("coachCode", params.coachCode);
  const response = await apiFetch<unknown>(`/v1/Coach/profile-by-id?${query}`, {
    // Public profile. Do not attach a coach session — that would skip the cache.
    next: { revalidate: 60 },
    skipAuth: true,
  });
  return {
    ...response,
    responseObj: normalizeProfile(response.responseObj),
  } satisfies GenericResponse<CoachProfile>;
}

function normalizeRegisterResult(raw: unknown): CoachRegisterResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const coachId = Number(pick(r, "coachId", "CoachId") ?? 0);
  const coachCode = String(pick(r, "coachCode", "CoachCode") ?? "").trim();
  if (coachId <= 0 || !coachCode) return null;
  const plainPassword =
    pick<string | null>(r, "plainPassword", "PlainPassword") ?? undefined;
  return {
    coachId,
    coachCode,
    plainPassword: plainPassword || undefined,
  };
}

export async function registerCoach(body: CoachRegisterInput) {
  const response = await apiFetch<unknown>("/v1/Coach/save", {
    method: "POST",
    body: JSON.stringify({
      coachId: 0,
      coachTypeCode: body.coachTypeCode || "HEALTH",
      ...body,
    }),
  });
  return {
    ...response,
    responseObj: normalizeRegisterResult(response.responseObj),
  } satisfies GenericResponse<CoachRegisterResult>;
}

/** Attach logo / profile photo URLs after Document upload. */
export async function updateCoachMedia(body: CoachMediaUpdateInput) {
  const response = await apiFetch<unknown>("/v1/Coach/save", {
    method: "POST",
    body: JSON.stringify({
      coachId: body.coachId,
      logo_Url: body.logo_Url,
      profile_Pic_Url: body.profile_Pic_Url,
    }),
  });
  return {
    ...response,
    responseObj: normalizeRegisterResult(response.responseObj),
  } satisfies GenericResponse<CoachRegisterResult>;
}

export async function submitCoachEnquiry(body: CoachEnquiryInput) {
  return apiFetch<unknown>("/v1/Coach/enquiry", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
