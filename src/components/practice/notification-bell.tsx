"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AppNotification,
  NotificationPreference,
} from "@/types/notification";

import { useUnreadNotifications } from "@/components/practice/use-unread-notifications";
import {
  clearNotifications,
  deleteNotification,
  fetchNotificationPreferences,
  fetchNotifications,
  markNotificationsRead,
  markNotificationUnread,
  updateNotificationPreference,
} from "@/lib/api/notifications";
import { notificationHref, timeAgo } from "@/lib/notification-link";
import { premiumHref } from "@/lib/premium-link";
import { cn } from "@/lib/utils";

const GROUP_ICON: Record<string, string> = {
  LEADS_CLIENTS: "fas fa-users",
  BUSINESS: "fas fa-briefcase",
  SUBSCRIPTION: "fas fa-award",
  FEEDBACK: "fas fa-comment-dots",
};

const GROUP_HINT: Record<string, string> = {
  LEADS_CLIENTS:
    "New leads waiting, client check-ups due, incomplete client profiles",
  BUSINESS: "Packages, events, gallery and success stories",
  SUBSCRIPTION: "Reminders before your plan ends",
  FEEDBACK: "Feedback received and clients you have not asked yet",
};

/** The bell in the top bar. Its dropdown holds the whole notification list, so there is no separate page. */
export function NotificationBell({
  coach,
}: {
  coach: { coachId?: number; coachCode?: string } | null;
}) {
  const router = useRouter();
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { count, refresh } = useUnreadNotifications(!!coach?.coachCode);

  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reload the list each time the panel opens, so it always matches the server.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void Promise.all([fetchNotifications(1), fetchNotificationPreferences()])
      .then(([first, preferences]) => {
        if (cancelled) return;
        setItems(first.items);
        setHasMore(first.hasMore);
        setPage(1);
        setPrefs(preferences);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setError(
          err instanceof Error ? err.message : "Could not load notifications.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const next = await fetchNotifications(page + 1);
      setItems((prev) => [...(prev ?? []), ...next.items]);
      setHasMore(next.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load more alerts.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [page]);

  function fail(err: unknown, fallback: string) {
    setError(err instanceof Error ? err.message : fallback);
  }

  function openItem(item: AppNotification) {
    if (!item.isRead) {
      setItems((prev) =>
        (prev ?? []).map((n) =>
          n.id === item.id ? { ...n, isRead: true } : n,
        ),
      );
      void markNotificationsRead(item.id)
        .then(refresh)
        .catch(() => undefined);
    }
    setOpen(false);
    // The checkout page needs to know which coach is paying.
    router.push(
      item.route === "premium" ?
        premiumHref(coach)
      : notificationHref(item.route, item.refCode),
    );
  }

  async function toggleRead(item: AppNotification) {
    const nextRead = !item.isRead;
    setItems((prev) =>
      (prev ?? []).map((n) =>
        n.id === item.id ? { ...n, isRead: nextRead } : n,
      ),
    );
    try {
      await (nextRead ?
        markNotificationsRead(item.id)
      : markNotificationUnread(item.id));
      refresh();
    } catch (err) {
      setItems((prev) =>
        (prev ?? []).map((n) =>
          n.id === item.id ? { ...n, isRead: item.isRead } : n,
        ),
      );
      fail(err, "Could not update that.");
    }
  }

  async function remove(item: AppNotification) {
    try {
      await deleteNotification(item.id);
      setItems((prev) => (prev ?? []).filter((n) => n.id !== item.id));
      refresh();
    } catch (err) {
      fail(err, "Could not delete that.");
    }
  }

  async function markAll() {
    try {
      await markNotificationsRead();
      setItems((prev) => (prev ?? []).map((n) => ({ ...n, isRead: true })));
      refresh();
    } catch (err) {
      fail(err, "Could not mark as read.");
    }
  }

  async function clearAll() {
    if (
      !window.confirm(
        "Clear all notifications? They will be removed from this list.",
      )
    )
      return;
    try {
      await clearNotifications();
      setItems([]);
      setHasMore(false);
      refresh();
    } catch (err) {
      fail(err, "Could not clear them.");
    }
  }

  async function toggleGroup(groupCode: string, isEnabled: boolean) {
    setPrefs((prev) =>
      prev.map((p) => (p.groupCode === groupCode ? { ...p, isEnabled } : p)),
    );
    try {
      setPrefs(await updateNotificationPreference(groupCode, isEnabled));
      setError(null);
    } catch (err) {
      setPrefs((prev) =>
        prev.map((p) =>
          p.groupCode === groupCode ? { ...p, isEnabled: !isEnabled } : p,
        ),
      );
      fail(err, "Could not save that.");
    }
  }

  const hasItems = !!items && items.length > 0;
  const hasUnread = (items ?? []).some((n) => !n.isRead);

  return (
    <div className="cl-notif-wrap" ref={wrapRef}>
      <button
        type="button"
        className="cl-notif-btn"
        title="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          count > 0 ? `Notifications, ${count} unread` : "Notifications"
        }
        onClick={() => {
          setError(null);
          setShowSettings(false);
          setOpen((v) => !v);
        }}
      >
        <i className="fas fa-bell" />
        {count > 0 ?
          <span className="cl-notif-badge">{count > 9 ? "9+" : count}</span>
        : null}
      </button>

      {open ?
        <div
          id={panelId}
          className="cl-notif-panel"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="cl-notif-panel-head">
            <strong>
              {showSettings ? "Notification settings" : "Notifications"}
            </strong>
            <div className="cl-notif-tools">
              {showSettings ?
                <button type="button" onClick={() => setShowSettings(false)}>
                  <i className="fas fa-arrow-left" /> Back
                </button>
              : <>
                  {hasUnread ?
                    <button type="button" onClick={() => void markAll()}>
                      <i className="fas fa-check-double" /> Mark all read
                    </button>
                  : null}
                  {hasItems ?
                    <button
                      type="button"
                      className="cl-notif-danger"
                      onClick={() => void clearAll()}
                    >
                      <i className="fas fa-trash-alt" /> Clear all
                    </button>
                  : null}
                  <button
                    type="button"
                    aria-label="Notification settings"
                    title="Notification settings"
                    onClick={() => setShowSettings(true)}
                  >
                    <i className="fas fa-cog" />
                  </button>
                </>
              }
            </div>
          </div>

          {error ?
            <p className="cl-notif-error" role="alert">
              {error}
            </p>
          : null}

          <div className="cl-notif-panel-body">
            {showSettings ?
              <>
                <p className="cl-notif-hint">
                  Push alerts arrive on the Mera Coach app. These switches apply
                  to the app and to this list.
                </p>
                {prefs.map((p) => (
                  <label key={p.groupCode} className="cl-notif-pref">
                    <span>
                      <strong>{p.label}</strong>
                      <small>{GROUP_HINT[p.groupCode] ?? ""}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={p.isEnabled}
                      onChange={(event) =>
                        void toggleGroup(p.groupCode, event.target.checked)
                      }
                    />
                  </label>
                ))}
              </>
            : items == null ?
              <p className="cl-notif-empty">Loading…</p>
            : items.length === 0 ?
              <p className="cl-notif-empty">
                Nothing here yet. Reminders about leads, check-ups and client
                feedback will show up here.
              </p>
            : <>
                <ul className="cl-notif-list">
                  {items.map((item) => (
                    <li key={item.id} className="cl-notif-item">
                      <button
                        type="button"
                        className={cn(
                          "cl-notif-row",
                          !item.isRead && "is-unread",
                        )}
                        onClick={() => openItem(item)}
                      >
                        <span className="cl-notif-icon" aria-hidden>
                          <i
                            className={
                              GROUP_ICON[item.groupCode] ?? "fas fa-bell"
                            }
                          />
                        </span>
                        <span className="cl-notif-text">
                          <span className="cl-notif-title">
                            {item.title}
                            {item.isRead ? null : (
                              <span
                                className="cl-notif-dot"
                                aria-label="Unread"
                              />
                            )}
                          </span>
                          <span className="cl-notif-body">{item.body}</span>
                          <span className="cl-notif-time">
                            {timeAgo(item.createdAt)}
                          </span>
                        </span>
                      </button>
                      <span className="cl-notif-actions">
                        <button
                          type="button"
                          title={
                            item.isRead ? "Mark as unread" : "Mark as read"
                          }
                          aria-label={
                            item.isRead ? "Mark as unread" : "Mark as read"
                          }
                          onClick={() => void toggleRead(item)}
                        >
                          <i
                            className={
                              item.isRead ? "far fa-envelope" : (
                                "far fa-envelope-open"
                              )
                            }
                          />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          aria-label="Delete notification"
                          className="cl-notif-danger"
                          onClick={() => void remove(item)}
                        >
                          <i className="far fa-trash-alt" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                {hasMore ?
                  <button
                    type="button"
                    className="cl-notif-more"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                : null}
              </>
            }
          </div>
        </div>
      : null}
    </div>
  );
}
