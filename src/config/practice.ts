/**
 * Authenticated coach area.
 * Mirrors mera-coach-app subscription gating when the flag is on.
 */

function readFlag(raw: string | undefined): boolean {
  const v = raw?.trim().toLowerCase() ?? "";
  return v === "yes" || v === "true" || v === "1";
}

/** Same semantics as app `EXPO_PUBLIC_SUBSCRIPTION_REQUIRED`. */
export function isSubscriptionRequired(): boolean {
  return readFlag(process.env.NEXT_PUBLIC_SUBSCRIPTION_REQUIRED);
}

/** Same cap as mera-coach-app when subscription gating is off. */
export const FREE_CLIENT_LIMIT = 10;
