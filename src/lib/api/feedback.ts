import type { GenericResponse } from "@/lib/api/types";
import type { FeedbackContext, FeedbackSubmitInput } from "@/types/feedback";

import { apiFetch } from "@/lib/api/client";
import { pick } from "@/lib/api/normalize";

function normalizeContext(raw: unknown): FeedbackContext | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    coachCode: String(pick(r, "coachCode", "CoachCode") ?? ""),
    coachName: String(pick(r, "coachName", "CoachName") ?? ""),
    clientCode: String(pick(r, "clientCode", "ClientCode") ?? ""),
    clientName: String(pick(r, "clientName", "ClientName") ?? ""),
  };
}

export async function fetchFeedbackContext(params: {
  coachCode: string;
  clientCode: string;
}) {
  const query = new URLSearchParams(params);
  const response = await apiFetch<unknown>(
    `/v1/Coach/feedback-context?${query}`,
  );
  return {
    ...response,
    responseObj: normalizeContext(response.responseObj),
  } satisfies GenericResponse<FeedbackContext>;
}

export async function submitFeedback(body: FeedbackSubmitInput) {
  return apiFetch<{ feedbackId?: number }>("/v1/Coach/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
