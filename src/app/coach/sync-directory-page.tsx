"use client";

import { useEffect } from "react";

/** Replace a stale directory URL after the server clamps an out-of-range page. */
export function SyncDirectoryPage({ href }: { href: string }) {
  useEffect(() => {
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== href) {
      window.history.replaceState(null, "", href);
    }
  }, [href]);

  return null;
}
