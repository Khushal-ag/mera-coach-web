"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CoachSession } from "@/lib/auth/types";

import {
  clearSession,
  getSession,
  saveSession as persistSession,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<CoachSession | null>(null);
  const [ready, setReady] = useState(false);

  const setSession = useCallback((next: CoachSession | null) => {
    if (next) persistSession(next);
    else clearSession();
    setSessionState(next);
  }, []);

  const refresh = useCallback(async () => {
    setSessionState(restoreSession());
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    clearSession();
    setSessionState(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSessionState(restoreSession());
      setReady(true);
    }, 0);
    const unsubscribe = subscribeToAuthSession(() => {
      setSessionState(getSession());
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

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
