"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchUnreadNotificationCount } from "@/lib/api/notifications";

const REFRESH_MS = 60_000;

/**
 * Number on the bell: checked on load and once a minute while the tab is open. `refresh` re-checks now,
 * for when alerts are read or removed.
 * shortcut: polls instead of subscribing, fine for one small count per coach.
 */
export function useUnreadNotifications(enabled: boolean): {
  count: number;
  refresh: () => void;
} {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    void fetchUnreadNotificationCount()
      .then(setCount)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const first = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, REFRESH_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [enabled, refresh]);

  return { count, refresh };
}
