import type {
  DocumentListItem,
  UploadDocumentInput,
  UploadDocumentResult,
} from "@/types/document";

import { authedFetch } from "@/lib/api/authed";
import { apiFetch } from "@/lib/api/client";
import { firstApiError, isApiSuccess, pick } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import {
  COACH_GALLERY_DOC_TYPE,
  COACH_GALLERY_REF_TYPE,
} from "@/types/document";

function normalizeUploadResult(raw: unknown): UploadDocumentResult | null {
  if (typeof raw === "string") {
    const url = raw.trim();
    return url ? { url } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const url = String(pick(r, "url", "Url") ?? "").trim();
  if (!url) return null;
  const docIdRaw = pick<unknown>(r, "docId", "DocId");
  const docId = Number(docIdRaw);
  return {
    url,
    docId: Number.isFinite(docId) && docId > 0 ? Math.trunc(docId) : undefined,
  };
}

function normalizeDocId(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 0;
}

/**
 * Upload via meracoachapi Document module (coach media, gallery, client progress).
 */
export async function uploadDocument(
  body: UploadDocumentInput,
  /** Registration token, only for the first upload before the coach has signed in. */
  token?: string,
): Promise<UploadDocumentResult> {
  const response = await apiFetch<unknown>("/v1/Document/upload", {
    method: "POST",
    ...(token ? { bearer: token } : {}),
    body: JSON.stringify({
      base64DataUrl: body.base64DataUrl,
      coachCode: body.coachCode,
      refCode: body.refCode,
      refType: body.refType,
      docType: body.docType,
      savedBy: body.savedBy,
    }),
  });

  if (!isApiSuccess(response)) {
    throw new ApiRequestError(
      firstApiError(response) ?? "Image upload failed.",
      0,
      response.errorObj,
    );
  }

  const result = normalizeUploadResult(response.responseObj);
  if (!result?.url) {
    throw new ApiRequestError(
      "Upload succeeded but no image URL was returned.",
      0,
    );
  }
  return result;
}

function normalizeDocumentList(rows: unknown[] | null): DocumentListItem[] {
  return (rows ?? [])
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      const filePath = String(pick(r, "filePath", "FilePath") ?? "").trim();
      const fcdtRaw = pick(r, "fcdt", "FCDT");
      return {
        docId: normalizeDocId(pick(r, "docId", "DocId")),
        filePath,
        fcdt: typeof fcdtRaw === "string" ? fcdtRaw : undefined,
      } satisfies DocumentListItem;
    })
    .filter((item) => item.docId > 0 && item.filePath.length > 0);
}

export async function listDocuments(params: {
  coachCode: string;
  refCode: string;
  refType: string;
  docType: string;
}): Promise<DocumentListItem[]> {
  const data = await authedFetch<unknown[] | null>("v1/Document/list", {
    method: "GET",
    searchParams: {
      coachCode: params.coachCode,
      refCode: params.refCode,
      refType: params.refType,
      docType: params.docType,
    },
  });
  return normalizeDocumentList(data);
}

/** Anonymous gallery for a public coach page. Empty when the coach has no photos. */
export async function listPublicCoachGallery(
  coachCode: string,
): Promise<DocumentListItem[]> {
  const code = coachCode.trim();
  if (!code) return [];
  const query = new URLSearchParams({
    coachCode: code,
    refCode: code,
    refType: COACH_GALLERY_REF_TYPE,
    docType: COACH_GALLERY_DOC_TYPE,
  });
  const response = await apiFetch<unknown[] | null>(
    `/v1/Document/list?${query}`,
    { next: { revalidate: 60 }, skipAuth: true },
  );
  if (!isApiSuccess(response) || !response.responseObj) return [];
  return normalizeDocumentList(response.responseObj);
}

export async function deleteDocument(params: {
  docId: number;
  coachCode: string;
}): Promise<void> {
  const docId = normalizeDocId(params.docId);
  const coachCode = params.coachCode.trim();
  if (docId <= 0) throw new Error("Cannot delete photo: missing document id.");
  if (!coachCode) throw new Error("Cannot delete photo: missing coach code.");
  await authedFetch("v1/Document/delete", {
    method: "POST",
    body: { docId, coachCode },
  });
}
