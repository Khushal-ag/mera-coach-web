import type { AdminSession } from "@/lib/auth/admin-types";

import { ADMIN_SESSION_STORAGE_KEY } from "@/constants/app";

let current: AdminSession | null = null;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

function readStorageRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function subscribeToAdminSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAdminToken(): string | null {
  return current?.token ?? null;
}

export function getAdminSession(): AdminSession | null {
  return current;
}

export function saveAdminSession(session: AdminSession): void {
  current = session;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        ADMIN_SESSION_STORAGE_KEY,
        JSON.stringify(current),
      );
    } catch {
      // Quota / private mode — memory session still works for this tab
    }
  }
  notify();
}

function restoreAdminSession(): AdminSession | null {
  try {
    const raw = readStorageRaw();
    if (!raw) {
      current = null;
      return null;
    }
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.token || parsed.role !== "ADMIN") {
      clearAdminSession();
      return null;
    }
    if (isJwtExpired(parsed.token)) {
      clearAdminSession();
      return null;
    }
    current = parsed;
    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function reloadAdminSession(): AdminSession | null {
  const session = restoreAdminSession();
  notify();
  return session;
}

export function clearAdminSession(): void {
  current = null;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  notify();
}

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

function decodeJwtPayload(
  token: string,
): { exp?: number; Role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as { exp?: number; Role?: string };
  } catch {
    return null;
  }
}

function isJwtExpired(token: string): boolean {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload) return true;
    if (typeof payload.exp !== "number") return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === ADMIN_SESSION_STORAGE_KEY) {
      restoreAdminSession();
      notify();
    }
  });
}
