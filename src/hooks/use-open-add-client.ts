"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { SUPPORT_EMAIL } from "@/config/contact";
import { FREE_CLIENT_LIMIT, isSubscriptionRequired } from "@/config/practice";
import { ADD_CLIENT_PREMIUM_HREF } from "@/constants/routes";
import { resolveAddClientAccess } from "@/lib/add-client-access";
import { fetchClientList } from "@/lib/api/practice";
import { ensurePremiumStatus } from "@/lib/auth/premium-status";
import { getSession } from "@/lib/auth/session";

function clientLimitMessage() {
  return `You can add up to ${FREE_CLIENT_LIMIT} clients for now. To add more, write to us at ${SUPPORT_EMAIL}.`;
}

/**
 * Add Client uses the premium flag already stored on the session.
 * A click does not wait on the network when that flag is known.
 */
export function useOpenAddClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const openAddClient = useCallback(async () => {
    setError(null);
    if (!isSubscriptionRequired()) {
      const coachCode = getSession()?.coachCode?.trim();
      if (!coachCode) {
        setError("Sign in required.");
        return;
      }
      try {
        const clients = await fetchClientList({ coachCode });
        if (clients.length >= FREE_CLIENT_LIMIT) {
          setError(clientLimitMessage());
          return;
        }
      } catch (err) {
        setError(
          err instanceof Error ?
            err.message
          : "Could not check your clients. Try again.",
        );
        return;
      }
      router.push("/dashboard/clients/new");
      return;
    }
    let paid = getSession()?.premiumPaid;
    if (typeof paid !== "boolean") {
      try {
        paid = await ensurePremiumStatus();
      } catch (err) {
        setError(
          err instanceof Error ?
            err.message
          : "Could not check subscription. Try again.",
        );
        return;
      }
    }
    if (typeof paid !== "boolean") {
      setError("Could not check subscription. Try again.");
      return;
    }
    router.push(
      resolveAddClientAccess(true, paid) === "wizard" ?
        "/dashboard/clients/new"
      : ADD_CLIENT_PREMIUM_HREF,
    );
  }, [router]);

  return { openAddClient, error };
}
