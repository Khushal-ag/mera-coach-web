const SENTENCE = /^(.+?[.!?])(?:\s+|$)/s;
/** A first sentence shorter than this is only a greeting ("Great news, Asha!"), so the next one is pulled in with it. */
const MIN_LEAD = 28;

/**
 * Splits an alert's text into what happened (the first sentence) and what to do about it (the rest), so the list can
 * show the two in different weights instead of one grey paragraph. Same rule as the mobile app.
 */
export function splitBody(body: string): { lead: string; rest: string } {
  let lead = "";
  let rest = body.trim();
  while (rest) {
    const match = SENTENCE.exec(rest);
    const sentence = match?.[1] ?? rest;
    lead = lead ? `${lead} ${sentence}` : sentence;
    rest = rest.slice(match ? match[0].length : rest.length).trim();
    if (lead.length >= MIN_LEAD) break;
  }
  return { lead, rest };
}

const ACTION_BY_TYPE: Record<string, string> = {
  FEEDBACK_RECEIVED: "Read feedback",
  FEEDBACK_NONE: "Request feedback",
  LEAD_PENDING: "Contact lead",
  CHECKUP_DUE: "Update health details",
  CLIENT_INCOMPLETE: "Complete profile",
  SUBSCRIPTION_EXPIRY: "Renew plan",
  SUCCESS_STORY: "Share story",
  PACKAGE_UNPUBLISHED: "Publish package",
  PACKAGE_NONE: "Create package",
  EVENT_NONE: "Add event",
  GALLERY_NONE: "Upload photos",
};

const ACTION_BY_ROUTE: Record<string, string> = {
  leads: "View leads",
  client: "Open client",
  premium: "Renew plan",
  packages: "Open packages",
  posts: "Open events",
  reviews: "Read feedback",
};

/** The button label under an alert, naming what clicking it does. */
export function actionLabel(type: string, route: string): string {
  return ACTION_BY_TYPE[type] ?? ACTION_BY_ROUTE[route] ?? "Open";
}
