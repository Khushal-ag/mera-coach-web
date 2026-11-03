"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { CoachSession } from "@/lib/auth/types";

import { isSubscriptionRequired } from "@/config/practice";
import { markClientReady, useMounted } from "@/hooks/use-mounted";
import { ensurePremiumStatus } from "@/lib/auth/premium-status";
import {
  clearSession,
  getSession,
  saveSession as persistSession,
  reloadSession,
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

/** Memory only. localStorage is restored after mount, never during hydration. */
function getClientSessionSnapshot(): CoachSession | null {
  return getSession();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const ready = useMounted();
  const storeSession = useSyncExternalStore(
    subscribeToAuthSession,
    getClientSessionSnapshot,
    () => null,
  );

  useEffect(() => {
    const restored = reloadSession();
    markClientReady();
    if (
      isSubscriptionRequired() &&
      restored &&
      typeof restored.premiumPaid !== "boolean"
    ) {
      void ensurePremiumStatus().catch(() => undefined);
    }
  }, []);

  const setSession = useCallback((next: CoachSession | null) => {
    if (next) persistSession(next);
    else clearSession();
  }, []);

  const refresh = useCallback(async () => {
    reloadSession();
  }, []);

  const logout = useCallback(async () => {
    clearSession();
  }, []);

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
