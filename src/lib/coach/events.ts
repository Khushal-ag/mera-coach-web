import type { CoachEvent } from "@/types/coach";

import { MAX_COACH_EVENTS, PUBLIC_UPCOMING_EVENTS } from "@/constants/coach";
import { coerceJsonList } from "@/lib/coach/coerce-json-list";

/** Accept arrays or JSON strings from profile GET responses. */
export function parseCoachEvents(raw: unknown): CoachEvent[] {
  const list = coerceJsonList(raw);
  return list
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = String(row.title ?? row.name ?? "").trim();
      if (!title) return null;
      const imageUrl = String(row.imageUrl ?? row.image ?? "").trim();
      return {
        id: String(row.id ?? `evt_${index}`),
        title,
        date: String(row.date ?? row.eventDate ?? "").trim(),
        time: String(row.time ?? row.eventTime ?? "").trim(),
        location: String(row.location ?? row.city ?? "").trim(),
        link: String(row.link ?? row.url ?? "").trim(),
        ...(imageUrl ? { imageUrl } : {}),
      } satisfies CoachEvent;
    })
    .filter((e): e is CoachEvent => !!e)
    .slice(0, MAX_COACH_EVENTS);
}

export function pickEventsRaw(raw: Record<string, unknown>): unknown {
  return (
    raw.events ??
    raw.Events ??
    raw.eventsJson ??
    raw.EventsJson ??
    raw.coachEvents ??
    raw.coachEventsJson
  );
}

/** Upcoming first (by date), then undated; past dates excluded when date parses. */
export function getUpcomingCoachEvents(
  events: CoachEvent[],
  startOfTodayMs: number,
  limit = PUBLIC_UPCOMING_EVENTS,
): CoachEvent[] {
  const startOfToday = startOfTodayMs;

  const withSort = events.map((event, index) => {
    const ts = parseEventDateMs(event.date);
    return { event, index, ts };
  });

  const upcoming = withSort.filter((row) => {
    if (row.event.date.trim() && row.ts == null) return false;
    return row.ts == null || row.ts >= startOfToday;
  });
  upcoming.sort((a, b) => {
    if (a.ts == null && b.ts == null) return a.index - b.index;
    if (a.ts == null) return 1;
    if (b.ts == null) return -1;
    if (a.ts !== b.ts) return a.ts - b.ts;
    return a.index - b.index;
  });

  return upcoming.slice(0, limit).map((row) => row.event);
}

function parseEventDateMs(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (ymd) {
    const y = parseInt(ymd[1]!, 10);
    const m = parseInt(ymd[2]!, 10) - 1;
    const d = parseInt(ymd[3]!, 10);
    const dt = new Date(y, m, d);
    if (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d) {
      return dt.getTime();
    }
  }

  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (dmy) {
    const d = parseInt(dmy[1]!, 10);
    const m = parseInt(dmy[2]!, 10) - 1;
    const y = parseInt(dmy[3]!, 10);
    const dt = new Date(y, m, d);
    if (dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d) {
      return dt.getTime();
    }
  }

  const fallback = Date.parse(trimmed);
  return Number.isFinite(fallback) ? fallback : null;
}

export function formatEventDateLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const ms = parseEventDateMs(trimmed);
  if (ms == null) return trimmed;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
