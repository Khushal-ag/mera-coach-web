"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { CoachSession } from "@/lib/auth/types";

import {
  clearSession,
  getSession,
  saveSession as persistSession,
  reloadSession,
  restoreSession,
  subscribeToAuthSession,
} from "@/lib/auth/session";

type AuthContextValue = {
  session: CoachSession | null;
  ready: boolean;
  setSession: (session: CoachSession | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const subscribeNever = () => () => {};

/** True only after hydration — server + first client paint both see false. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

let didRestoreFromStorage = false;

function getClientSessionSnapshot(): CoachSession | null {
  if (!didRestoreFromStorage) {
    didRestoreFromStorage = true;
    restoreSession();
  }
  return getSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const storeSession = useSyncExternalStore(
    subscribeToAuthSession,
    getClientSessionSnapshot,
    () => null,
  );

  const setSession = useCallback((next: CoachSession | null) => {
    if (next) persistSession(next);
    else clearSession();
  }, []);

  const refresh = useCallback(async () => {
    didRestoreFromStorage = true;
    reloadSession();
  }, []);

  const logout = useCallback(async () => {
    clearSession();
  }, []);

  const ready = hydrated;
  const session = ready ? storeSession : null;

  const value = useMemo(
    () => ({ session, ready, setSession, refresh, logout }),
    [session, ready, setSession, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
