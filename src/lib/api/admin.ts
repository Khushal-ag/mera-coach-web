import type { GenericResponse } from "@/lib/api/types";
import type { AdminSession } from "@/lib/auth/admin-types";

import { assertApiBaseUrl } from "@/config/env";
import {
  firstApiError,
  isApiSuccess,
  normalizeApiBody,
  num,
  pick,
  text,
} from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import {
  clearAdminSession,
  getAdminToken,
  saveAdminSession,
} from "@/lib/auth/admin-session";

export type CoachStatsRow = {
  coachCode: string;
  coachName: string;
  email: string;
  mobile: string;
  registeredOn: string;
  emailVerified: string;
  isProfileVisible: number;
  validUpto: string;
  validityExpired: string;
  clients: number;
  checkups: number;
  leads: number;
  packageCount: number;
  coachEvent: number;
};

export type CoachAd = {
  adId: number;
  coachCode: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  altText: string;
  sortOrder: number;
  isActive: boolean;
};

export type SaveCoachAdInput = {
  adId?: number;
  coachCode?: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  altText?: string;
  sortOrder?: number;
  isActive?: boolean;
};

function adminUrl(path: string) {
  const base = assertApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function adminFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<GenericResponse<T>> {
  const { skipAuth, headers, ...rest } = init ?? {};
  const token = skipAuth ? null : getAdminToken();

  let res: Response;
  try {
    res = await fetch(adminUrl(path), {
      ...rest,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the server. Check your connection and try again.",
      0,
      [],
    );
  }

  let body: GenericResponse<T> | null;
  try {
    body = normalizeApiBody<T>(await res.json());
  } catch {
    body = null;
  }

  if (res.status === 401 && typeof window !== "undefined" && token) {
    clearAdminSession();
  }

  if (!res.ok) {
    const errors = body?.errorObj ?? [];
    const message =
      errors[0]?.errorMessage ??
      (res.status === 401 ?
        "Admin session expired. Please sign in again."
      : "The request could not be completed.");
    throw new ApiRequestError(message, res.status, errors);
  }

  return body ?? { errorObj: [], responseObj: null };
}

function normalizeStatsRow(raw: unknown): CoachStatsRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const coachCode = text(pick(r, "coachCode", "CoachCode"));
  if (!coachCode) return null;
  return {
    coachCode,
    coachName: text(pick(r, "coachName", "CoachName")),
    email: text(pick(r, "email", "Email")),
    mobile: text(pick(r, "mobile", "Mobile")),
    registeredOn: text(
      pick(r, "registered_On", "Registered_On", "registeredOn"),
    ),
    emailVerified: text(
      pick(r, "email_Verified", "Email_Verified", "emailVerified"),
    ),
    isProfileVisible: num(pick(r, "isProfileVisible", "IsProfileVisible")),
    validUpto: text(pick(r, "validUpto", "ValidUpto")),
    validityExpired: text(pick(r, "validityExpired", "ValidityExpired") ?? ""),
    clients: num(pick(r, "clients", "Clients")),
    checkups: num(pick(r, "checkups", "Checkups")),
    leads: num(pick(r, "leads", "Leads")),
    packageCount: num(pick(r, "package", "Package")),
    coachEvent: num(pick(r, "coachEvent", "CoachEvent")),
  };
}

function normalizeAd(raw: unknown): CoachAd | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const adId = num(pick(r, "adId", "AdId"));
  const imageUrl = text(pick(r, "imageUrl", "ImageUrl"));
  if (adId <= 0 || !imageUrl) return null;
  const activeRaw = pick(r, "isActive", "IsActive");
  const isActive =
    typeof activeRaw === "boolean" ? activeRaw : Number(activeRaw) === 1;
  return {
    adId,
    coachCode: text(pick(r, "coachCode", "CoachCode")),
    imageUrl,
    linkUrl: text(pick(r, "linkUrl", "LinkUrl")),
    title: text(pick(r, "title", "Title")),
    altText: text(pick(r, "altText", "AltText")),
    sortOrder: num(pick(r, "sortOrder", "SortOrder")),
    isActive,
  };
}

export async function loginAdmin(input: {
  userName: string;
  password: string;
}): Promise<{ error: string | null; session: AdminSession | null }> {
  const userName = input.userName.trim();
  const password = input.password;
  if (!userName || !password) {
    return {
      error: "Username and password are required.",
      session: null,
    };
  }

  try {
    const envelope = await adminFetch<Record<string, unknown>>("/Auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        userName,
        password,
        userType: "ADMIN",
      }),
    });

    if (!isApiSuccess(envelope) || !envelope.responseObj) {
      return {
        error: firstApiError(envelope) ?? "Login failed.",
        session: null,
      };
    }

    const r = envelope.responseObj;
    const token = text(pick(r, "token", "Token"));
    const role = text(pick(r, "role", "Role")).toUpperCase();
    if (!token || role !== "ADMIN") {
      return {
        error: "Login succeeded but no admin token was returned.",
        session: null,
      };
    }

    const session: AdminSession = {
      token,
      role: "ADMIN",
      fullName: text(pick(r, "fullName", "FullName")) || "Admin",
      email: text(pick(r, "email", "Email")) || userName,
    };
    saveAdminSession(session);
    return { error: null, session };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { error: error.message, session: null };
    }
    return {
      error: error instanceof Error ? error.message : "Login failed.",
      session: null,
    };
  }
}

export async function fetchCoachStats(): Promise<CoachStatsRow[]> {
  const envelope = await adminFetch<unknown[]>("/Admin/coach-stats");
  const rows = Array.isArray(envelope.responseObj) ? envelope.responseObj : [];
  return rows
    .map(normalizeStatsRow)
    .filter((row): row is CoachStatsRow => row != null);
}

export async function fetchAdminAds(): Promise<CoachAd[]> {
  const envelope = await adminFetch<unknown[]>("/Admin/ads");
  const rows = Array.isArray(envelope.responseObj) ? envelope.responseObj : [];
  return rows.map(normalizeAd).filter((row): row is CoachAd => row != null);
}

export async function fetchPublicAds(coachCode: string): Promise<CoachAd[]> {
  const qs = new URLSearchParams();
  if (coachCode.trim()) qs.set("coachCode", coachCode.trim());
  const envelope = await adminFetch<unknown[]>(
    `/Admin/ads/public?${qs.toString()}`,
    { skipAuth: true },
  );
  const rows = Array.isArray(envelope.responseObj) ? envelope.responseObj : [];
  return rows.map(normalizeAd).filter((row): row is CoachAd => row != null);
}

export async function saveCoachAd(input: SaveCoachAdInput): Promise<CoachAd> {
  const envelope = await adminFetch<unknown>("/Admin/ads", {
    method: "POST",
    body: JSON.stringify({
      adId: input.adId ?? 0,
      coachCode: input.coachCode?.trim() || null,
      imageUrl: input.imageUrl.trim(),
      linkUrl: input.linkUrl?.trim() || null,
      title: input.title?.trim() || null,
      altText: input.altText?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    }),
  });
  if (!isApiSuccess(envelope)) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Could not save creative.",
      0,
      envelope.errorObj,
    );
  }
  const ad = normalizeAd(envelope.responseObj);
  if (!ad) {
    throw new ApiRequestError(
      "Save succeeded but no creative was returned.",
      0,
    );
  }
  return ad;
}

export async function setCoachAdActive(
  adId: number,
  isActive: boolean,
): Promise<void> {
  const envelope = await adminFetch<unknown>(`/Admin/ads/${adId}/active`, {
    method: "POST",
    body: JSON.stringify({ isActive }),
  });
  if (!isApiSuccess(envelope)) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Could not update creative.",
      0,
      envelope.errorObj,
    );
  }
}

export async function deleteCoachAd(adId: number): Promise<void> {
  const envelope = await adminFetch<unknown>(`/Admin/ads/${adId}`, {
    method: "DELETE",
  });
  if (!isApiSuccess(envelope)) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Could not delete creative.",
      0,
      envelope.errorObj,
    );
  }
}

/** The preview image a website publishes for link sharing, so a creative can be made from a link alone. */
export async function fetchLinkPreview(url: string): Promise<string> {
  const envelope = await adminFetch<Record<string, unknown>>(
    `/Admin/ads/link-preview?url=${encodeURIComponent(url.trim())}`,
  );
  const image =
    isApiSuccess(envelope) && envelope.responseObj ?
      text(pick(envelope.responseObj, "imageUrl", "ImageUrl"))
    : "";
  if (!image) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Could not get a preview from that link.",
      0,
      envelope.errorObj,
    );
  }
  return image;
}

export async function uploadCoachAdImage(
  base64DataUrl: string,
): Promise<string> {
  const envelope = await adminFetch<Record<string, unknown>>(
    "/Admin/ads/upload",
    {
      method: "POST",
      body: JSON.stringify({ base64DataUrl }),
    },
  );
  if (!isApiSuccess(envelope) || !envelope.responseObj) {
    throw new ApiRequestError(
      firstApiError(envelope) ?? "Image upload failed.",
      0,
      envelope.errorObj,
    );
  }
  const url = text(pick(envelope.responseObj, "url", "Url"));
  if (!url)
    throw new ApiRequestError("Upload succeeded but no URL returned.", 0);
  return url;
}
