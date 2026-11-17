"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import type { AdminSession } from "@/lib/auth/admin-types";

import { markClientReady, useMounted } from "@/hooks/use-mounted";
import {
  clearAdminSession,
  getAdminSession,
  reloadAdminSession,
  saveAdminSession,
  subscribeToAdminSession,
} from "@/lib/auth/admin-session";

function subscribe(listener: () => void) {
  return subscribeToAdminSession(listener);
}

function getSnapshot(): AdminSession | null {
  return getAdminSession();
}

function getServerSnapshot(): AdminSession | null {
  return null;
}

export function useAdminSession() {
  const ready = useMounted();
  const storeSession = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    reloadAdminSession();
    markClientReady();
  }, []);

  const setSession = useCallback((next: AdminSession | null) => {
    if (next) saveAdminSession(next);
    else clearAdminSession();
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
  }, []);

  const session = ready ? storeSession : null;

  return { session, ready, setSession, logout };
}
