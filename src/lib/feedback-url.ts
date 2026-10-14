/**
 * Shared feedback link contract with mera-coach-app `buildFeedbackWebUrl`.
 * Client opens the public web form; query params identify coach + client.
 *
 * URL: `{siteUrl}/feedback?coachCode={code}&clientCode={code}`
 * API: GET `/v1/Coach/feedback-context?coachCode&clientCode`
 *      POST `/v1/Coach/feedback` { coachCode, clientCode, rating, comments?, clientName? }
 */

import { env } from "@/config/env";

export function buildFeedbackWebUrl(params: {
  coachCode: string;
  clientCode: string;
  siteUrl?: string;
}): string | null {
  const base = (params.siteUrl ?? env.siteUrl).replace(/\/$/, "");
  const coachCode = params.coachCode.trim();
  const clientCode = params.clientCode.trim();
  if (!base || !coachCode || !clientCode) return null;

  const qs = new URLSearchParams({ coachCode, clientCode });
  return `${base}/feedback?${qs.toString()}`;
}
