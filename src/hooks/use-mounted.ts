"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

/**
 * Stays false through server render and the hydrating client render.
 * AuthProvider flips it after mount, once sessionStorage has been read.
 */
let clientReady = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot() {
  return clientReady;
}

function getServerSnapshot() {
  return false;
}

export function markClientReady() {
  if (clientReady) return;
  clientReady = true;
  listeners.forEach((listener) => listener());
}

/** False on the server and on the hydration render. True after `markClientReady`. */
export function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
