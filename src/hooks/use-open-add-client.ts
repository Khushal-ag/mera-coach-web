"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { isSubscriptionRequired } from "@/config/practice";
import { fetchCoachPremiumOffer } from "@/lib/api/practice";

/**
 * Mirrors app `useOpenAddClient`: when subscription is required and unpaid,
 * send the coach to Premium; otherwise open the add-client form.
 */
export function useOpenAddClient() {
  const router = useRouter();
  const { session } = useAuth();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const openAddClient = useCallback(async () => {
    setError(null);
    if (!isSubscriptionRequired()) {
      router.push("/dashboard/clients/new");
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setChecking(true);
    try {
      const offer = await fetchCoachPremiumOffer();
      if (offer.isPaid) {
        router.push("/dashboard/clients/new");
      } else {
        const qs = new URLSearchParams();
        if (session?.coachId) qs.set("coachId", String(session.coachId));
        if (session?.coachCode) qs.set("coachCode", session.coachCode);
        qs.set("reason", "add-client");
        router.push(`/premium?${qs.toString()}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ?
          err.message
        : "Could not check subscription. Try again.",
      );
    } finally {
      busy.current = false;
      setChecking(false);
    }
  }, [router, session]);

  return { openAddClient, checking, error };
}
