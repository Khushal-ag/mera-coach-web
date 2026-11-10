import type {
  AppNotification,
  NotificationPage,
  NotificationPreference,
} from "@/types/notification";

import { authedFetch } from "@/lib/api/authed";
import { num, text } from "@/lib/api/normalize";

export const NOTIFICATION_PAGE_SIZE = 20;

function mapNotification(raw: unknown): AppNotification {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: num(r.notificationId),
    type: text(r.type),
    groupCode: text(r.groupCode),
    title: text(r.title),
    body: text(r.body),
    route: text(r.route),
    refCode: text(r.refCode),
    isRead: r.isRead === true,
    createdAt: text(r.createdAt),
  };
}

function mapPreference(raw: unknown): NotificationPreference {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    groupCode: text(r.groupCode),
    label: text(r.label),
    isEnabled: r.isEnabled !== false,
  };
}

export async function fetchNotifications(
  page: number,
): Promise<NotificationPage> {
  const raw = await authedFetch<Record<string, unknown> | null>(
    "Notification/list",
    { searchParams: { page, pageSize: NOTIFICATION_PAGE_SIZE } },
  );
  const items = Array.isArray(raw?.items) ? raw.items : [];
  return {
    items: items.map(mapNotification),
    unreadCount: num(raw?.unreadCount),
    hasMore: raw?.hasMore === true,
  };
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  return num(await authedFetch<number>("Notification/unread-count"));
}

/** Pass an id to mark one alert read, or nothing to mark them all. */
export async function markNotificationsRead(
  notificationId?: number,
): Promise<void> {
  await authedFetch<boolean>("Notification/read", {
    method: "POST",
    body: notificationId == null ? { all: true } : { notificationId },
  });
}

export async function markNotificationUnread(
  notificationId: number,
): Promise<void> {
  await authedFetch<boolean>("Notification/unread", {
    method: "POST",
    body: { notificationId },
  });
}

export async function deleteNotification(
  notificationId: number,
): Promise<void> {
  await authedFetch<boolean>(`Notification/${notificationId}`, {
    method: "DELETE",
  });
}

export async function clearNotifications(): Promise<void> {
  await authedFetch<boolean>("Notification/clear", { method: "POST" });
}

export async function fetchNotificationPreferences(): Promise<
  NotificationPreference[]
> {
  const raw = await authedFetch<unknown[]>("Notification/preferences");
  return (raw ?? []).map(mapPreference);
}

export async function updateNotificationPreference(
  groupCode: string,
  isEnabled: boolean,
): Promise<NotificationPreference[]> {
  const raw = await authedFetch<unknown[]>("Notification/preferences", {
    method: "PUT",
    body: { preferences: [{ groupCode, isEnabled }] },
  });
  return (raw ?? []).map(mapPreference);
}
