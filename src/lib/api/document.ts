import type {
  UploadDocumentInput,
  UploadDocumentResult,
} from "@/types/document";

import { apiFetch } from "@/lib/api/client";
import { firstApiError, isApiSuccess, pick } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";

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

/**
 * Upload a coach logo or profile photo via meracoachapi Document module.
 * Requires an existing coachCode (register first, then upload).
 */
export async function uploadCoachDocument(
  body: UploadDocumentInput,
): Promise<UploadDocumentResult> {
  const response = await apiFetch<unknown>("/v1/Document/upload", {
    method: "POST",
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
