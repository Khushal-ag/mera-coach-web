/** Coach subscription validity (the coach's ValidUpto date) for display. */

export type ValidityTone = "ok" | "soon" | "expired";

export type ValidityInfo = {
  /** Date shown to the coach, for example "15 Oct 2026". */
  dateLabel: string;
  tone: ValidityTone;
  /** Whole days left, 0 on the last day, negative once expired. */
  daysLeft: number;
};

/** Warn this many days before the end date. */
export const VALIDITY_WARN_DAYS = 15;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseDate(raw: string): Date | null {
  const text = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(text);
  const [y, m, d] =
    iso ? [+iso[1]!, +iso[2]!, +iso[3]!]
    : dmy ? [+dmy[3]!, +dmy[2]!, +dmy[1]!]
    : [];
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

export function describeValidity(
  raw?: string | null,
  today = new Date(),
): ValidityInfo | null {
  if (!raw) return null;
  const end = parseDate(raw);
  if (!end) return null;
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const daysLeft = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return {
    dateLabel: `${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`,
    tone:
      daysLeft < 0 ? "expired"
      : daysLeft <= VALIDITY_WARN_DAYS ? "soon"
      : "ok",
    daysLeft,
  };
}
