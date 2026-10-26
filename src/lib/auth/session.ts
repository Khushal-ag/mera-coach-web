import type { CoachSession } from "@/lib/auth/types";

import { SESSION_STORAGE_KEY } from "@/constants/app";

/**
 * Client session store — mirrors mera-coach-app SecureStore + in-memory token.
 * Uses localStorage so authentication persists across browser visits and tabs.
 */

let current: CoachSession | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readStorageRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
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

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // Quota / private mode — memory session still works for this tab
    }
  }

  notify();
}

function restoreSession(): CoachSession | null {
  try {
    const raw = readStorageRaw();
    if (!raw) {
      current = null;
      return null;
    }
    const parsed = JSON.parse(raw) as CoachSession;
    if (!parsed?.token || !parsed.coachId) {
      clearSession();
      return null;
    }
    if (isJwtExpired(parsed.token)) {
      clearSession();
      return null;
    }
    current = parsed;
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

/** Restore from persistent localStorage and notify subscribers. */
export function reloadSession(): CoachSession | null {
  const session = restoreSession();
  notify();
  return session;
}

export function clearSession(): void {
  current = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  notify();
}

/** Safe Base64URL decoder supporting unpadded strings and UTF-8 characters. */
function decodeBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const payload = decodeJwtPayload(token);
    if (!payload) return true;
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// Synchronize auth state across open browser tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === SESSION_STORAGE_KEY) {
      restoreSession();
      notify();
    }
  });
}
