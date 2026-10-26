import { beforeEach, describe, expect, test } from "bun:test";

import { SESSION_STORAGE_KEY } from "@/constants/app";

import {
  clearSession,
  getCurrentToken,
  getSession,
  reloadSession,
  saveSession,
  subscribeToAuthSession,
} from "../auth/session";

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: Storage }).localStorage =
    new MockStorage();
}
if (typeof globalThis.window === "undefined") {
  (
    globalThis as unknown as {
      window: {
        localStorage: Storage;
        addEventListener: () => void;
        removeEventListener: () => void;
      };
    }
  ).window = {
    localStorage: globalThis.localStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function createJwt(expSecondsFromNow: number): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = Buffer.from(
    JSON.stringify({ coachId: 101, coachName: "Test Coach", exp }),
  ).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("auth session management", () => {
  beforeEach(() => {
    clearSession();
    localStorage.clear();
  });

  test("saves session to both localStorage and memory", () => {
    const token = createJwt(3600);
    const session = {
      token,
      coachId: 101,
      coachCode: "TEST101",
      fullName: "Test Coach",
    };

    saveSession(session);

    expect(getSession()).toEqual(session);
    expect(getCurrentToken()).toBe(token);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe(
      JSON.stringify(session),
    );
  });

  test("restores valid session from localStorage", () => {
    const token = createJwt(3600);
    const session = {
      token,
      coachId: 101,
      coachCode: "TEST101",
      fullName: "Test Coach",
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    const restored = reloadSession();
    expect(restored).not.toBeNull();
    expect(restored?.coachId).toBe(101);
    expect(getSession()?.token).toBe(token);
  });

  test("clears and rejects expired JWT on restore", () => {
    const expiredToken = createJwt(-3600); // 1 hour ago
    const session = {
      token: expiredToken,
      coachId: 103,
      coachCode: "EXPIRED",
      fullName: "Expired Coach",
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    const restored = reloadSession();
    expect(restored).toBeNull();
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test("clearSession removes data from memory and storage", () => {
    const token = createJwt(3600);
    const session = {
      token,
      coachId: 104,
      coachCode: "LOGOUT",
      fullName: "Logout Coach",
    };

    saveSession(session);
    expect(getSession()).not.toBeNull();

    clearSession();
    expect(getSession()).toBeNull();
    expect(getCurrentToken()).toBeNull();
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  test("subscribers are notified when session updates", () => {
    let callCount = 0;
    const unsubscribe = subscribeToAuthSession(() => {
      callCount++;
    });

    const token = createJwt(3600);
    saveSession({
      token,
      coachId: 105,
      coachCode: "NOTIFY",
      fullName: "Notify Coach",
    });

    expect(callCount).toBe(1);

    clearSession();
    expect(callCount).toBe(2);

    unsubscribe();
    saveSession({
      token,
      coachId: 105,
      coachCode: "NOTIFY2",
      fullName: "Notify Coach 2",
    });
    expect(callCount).toBe(2);
  });
});
