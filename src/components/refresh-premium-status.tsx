"use client";

import { useEffect } from "react";

import { useAuth } from "@/components/auth-provider";
import { isSubscriptionRequired } from "@/config/practice";
import { refreshPremiumStatus } from "@/lib/auth/premium-status";

/** Reload GET /Coach/premium into the session when Profile or Premium opens. */
export function RefreshPremiumStatus() {
  const { session, ready } = useAuth();
  const token = session?.token;

  useEffect(() => {
    if (!isSubscriptionRequired() || !ready || !token) return;
    void refreshPremiumStatus().catch(() => undefined);
  }, [ready, token]);

  return null;
}
