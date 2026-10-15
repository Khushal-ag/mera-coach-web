"use client";

import { useCallback, useSyncExternalStore } from "react";

import { SIDEBAR_COLLAPSED_KEY } from "@/constants/app";

const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Desktop sidebar collapsed state, remembered between visits. Server render is always expanded. */
export function useSidebarCollapsed(): [boolean, () => void] {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, read() ? "0" : "1");
    } catch {
      // Storage blocked: the toggle simply does nothing.
    }
    listeners.forEach((listener) => listener());
  }, []);
  return [collapsed, toggle];
}
