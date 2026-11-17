import type { CoachStatsRow } from "@/lib/api/admin";

/** A plan with this many days or fewer left counts as "expiring soon". */
export const EXPIRING_SOON_DAYS = 30;

const DAY_MS = 86_400_000;

export type Segment =
  "all" | "live" | "hidden" | "expiring" | "expired" | "inactive";

export type CoachHealth = {
  /** Whole days until the plan ends; zero or below once it has ended. Null when the date is missing. */
  daysLeft: number | null;
  expired: boolean;
  expiringSoon: boolean;
  hidden: boolean;
  /** Visible on the site and the plan has not ended. */
  live: boolean;
  unverified: boolean;
  /** No clients, checkups, leads, packages or events yet. */
  inactive: boolean;
};

export const SEGMENT_TEST: Record<Segment, (health: CoachHealth) => boolean> = {
  all: () => true,
  live: (h) => h.live,
  hidden: (h) => h.hidden,
  expiring: (h) => h.expiringSoon,
  expired: (h) => h.expired,
  inactive: (h) => h.inactive,
};

export function truthyFlag(
  value: string | number | boolean | null | undefined,
) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return !["", "—", "-", "0", "n", "no", "false"].includes(v);
}

export function isExpiredFlag(value: string | null | undefined) {
  const v = String(value ?? "")
    .trim()
    .toLowerCase();
  return (
    !!v &&
    v !== "—" &&
    v !== "-" &&
    (v === "yes" ||
      v === "y" ||
      v === "1" ||
      v === "true" ||
      v.includes("expir"))
  );
}

export function assessCoach(row: CoachStatsRow, now: number): CoachHealth {
  const end = Date.parse(row.validUpto);
  const diff = Number.isNaN(end) ? null : end - now;
  const expired =
    (diff !== null && diff < 0) || isExpiredFlag(row.validityExpired);
  const daysLeft = diff === null ? null : Math.ceil(diff / DAY_MS);
  const hidden = row.isProfileVisible !== 1;
  return {
    daysLeft,
    expired,
    expiringSoon:
      !expired && daysLeft !== null && daysLeft <= EXPIRING_SOON_DAYS,
    hidden,
    live: !hidden && !expired,
    unverified: !truthyFlag(row.emailVerified),
    inactive:
      row.clients +
        row.checkups +
        row.leads +
        row.packageCount +
        row.coachEvent ===
      0,
  };
}

export function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : (
      date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
}
