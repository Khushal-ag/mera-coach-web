/**
 * Shared feedback link contract with mera-coach-app `buildFeedbackWebUrl`.
 * Client opens the public web form; query param `ref` contains encrypted coach + client token.
 *
 * URL: `{siteUrl}/feedback?ref={encrypted_token}` (legacy fallback: `?coachCode={code}&clientCode={code}`)
 * API: GET `/Coach/feedback-context?coachCode&clientCode`
 *      POST `/Coach/feedback` { coachCode, clientCode, rating, comments?, clientName? }
 */

import { env } from "@/config/env";

import { encodeFeedbackToken } from "./feedback-crypto";

export function buildFeedbackWebUrl(params: {
  coachCode: string;
  clientCode: string;
  siteUrl?: string;
}): string | null {
  // Always the public site address (NEXT_PUBLIC_SITE_URL), never the page the coach happens to be on:
  // a link copied from localhost or a preview deployment would not open for the client.
  const base = (params.siteUrl ?? env.siteUrl).replace(/\/$/, "");
  const coachCode = params.coachCode.trim();
  const clientCode = params.clientCode.trim();
  if (!base || !coachCode || !clientCode) return null;

  const token = encodeFeedbackToken(coachCode, clientCode);
  if (!token) return null;
  const qs = new URLSearchParams({ ref: token });
  return `${base}/feedback?${qs.toString()}`;
}

export function buildFeedbackMessage(params: {
  clientName?: string;
  coachName?: string;
  feedbackUrl: string;
}): string {
  const clientFirst = params.clientName?.trim().split(/\s+/)[0];
  const greeting = clientFirst ? `Hi ${clientFirst}` : "Hi";
  const coachBit =
    params.coachName?.trim() ?
      ` for your coach ${params.coachName.trim()}`
    : " for your coach";
  return `${greeting}, please share quick feedback${coachBit} on Mera Coach:\n${params.feedbackUrl}`;
}

export function buildFeedbackWhatsAppUrl(
  phone: string,
  message: string,
): string | null {
  const clean = phone.replace(/\D/g, "").replace(/^0+/, "");
  const digits = clean.length === 10 ? `91${clean}` : clean;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
