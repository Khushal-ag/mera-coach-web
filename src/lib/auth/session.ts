import type { CoachSession } from "@/lib/auth/types";

/**
 * Client session store — mirrors mera-coach-app SecureStore + in-memory token.
 * Choice: memory (sync reads for apiFetch) + sessionStorage (survives refresh
 * in the same tab; cleared when the tab closes). No httpOnly cookie / Next BFF.
 */
const STORAGE_KEY = "meracoach_coach_session";

let current: CoachSession | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function subscribeToAuthSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentToken(): string | null {
  return current?.token ?? null;
}

export function getSession(): CoachSession | null {
  return current;
}

export function saveSession(session: CoachSession): void {
  const previous = current;
  const premiumPaid =
    typeof session.premiumPaid === "boolean" ? session.premiumPaid
    : previous && previous.token === session.token ? previous.premiumPaid
    : undefined;
  current =
    typeof premiumPaid === "boolean" ? { ...session, premiumPaid } : session;
  if (canUseStorage()) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Quota / private mode — memory session still works for this tab life.
    }
  }
  notify();
}

export function restoreSession(): CoachSession | null {
  if (!canUseStorage()) {
    current = null;
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      current = null;
      return null;
    }
    const parsed = JSON.parse(raw) as CoachSession;
    if (!parsed?.token || !parsed.coachId) {
      sessionStorage.removeItem(STORAGE_KEY);
      current = null;
      return null;
    }
    if (isJwtExpired(parsed.token)) {
      sessionStorage.removeItem(STORAGE_KEY);
      current = null;
      return null;
    }
    current = parsed;
    return parsed;
  } catch {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    current = null;
    return null;
  }
}

/** Restore from sessionStorage and notify subscribers. */
export function reloadSession(): CoachSession | null {
  const session = restoreSession();
  notify();
  return session;
}

export function clearSession(): void {
  current = null;
  if (canUseStorage()) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  notify();
}

function isJwtExpired(token: string): boolean {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return true;
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
