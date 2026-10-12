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

export const practiceNav = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/checkups", label: "Checkups" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/packages", label: "Packages" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/profile", label: "Profile" },
] as const;
