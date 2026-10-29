"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import type {
  CoachPaymentHistoryItem,
  CoachPremiumOffer,
  CoachSubscriptionDetails,
} from "@/types/practice";
import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { useAuth } from "@/components/auth-provider";
import { PremiumActiveView } from "@/components/premium-active-view";
import { RefreshPremiumStatus } from "@/components/refresh-premium-status";
import { PremiumCheckoutSkeleton } from "@/components/skeletons/premium-plans-skeleton";
import { useMounted } from "@/hooks/use-mounted";
import {
  fetchCoachPaymentHistory,
  fetchCoachPremiumOffer,
} from "@/lib/api/practice";

const PremiumCheckout = dynamic(
  () =>
    import("@/components/premium-checkout").then((mod) => mod.PremiumCheckout),
  {
    loading: () => <PremiumCheckoutSkeleton />,
  },
);

type Props = {
  plans: CoachCatalogPlan[];
  promo?: CoachSuggestedPromo | null;
  initialCoachId?: number;
  initialCoachCode?: string;
  initialCoachName?: string;
};

/**
 * Checkout identity comes from the signed-in session, or from the app Pay Now
 * link (`coachId` / `coachCode`). Anonymous visits with neither go to login.
 * The coach code is never an editable field.
 *
 * If the signed-in coach already has an active subscription, display their
 * active plan status, validity, progress, and payment history like the mobile app.
 */
export function PremiumCheckoutAuth({
  plans,
  promo,
  initialCoachId = 0,
  initialCoachCode = "",
  initialCoachName = "",
}: Props) {
  const { session, ready } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [offer, setOffer] = useState<CoachPremiumOffer | null>(null);
  const [history, setHistory] = useState<CoachPaymentHistoryItem[]>([]);
  const [fetchDone, setFetchDone] = useState(false);

  const fromApp = initialCoachId > 0 || Boolean(initialCoachCode.trim());
  const returnPath = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `/premium?${qs}` : "/premium";
  }, [searchParams]);
  const loginHref = `/coach-login?next=${encodeURIComponent(returnPath)}`;

  useEffect(() => {
    if (!mounted || !ready || session || fromApp) return;
    router.replace(loginHref);
  }, [mounted, ready, session, fromApp, router, loginHref]);

  // Deep-link identity is on the server. A stored session is applied only
  // after mount, so the plan catalog paints without reading localStorage.
  const sessionCoach = mounted && ready && session ? session : null;
  const coachId =
    fromApp ? initialCoachId
    : sessionCoach && sessionCoach.coachId > 0 ? sessionCoach.coachId
    : 0;
  const coachCode =
    fromApp ? initialCoachCode.trim()
    : sessionCoach?.coachCode.trim() ? sessionCoach.coachCode.trim()
    : "";
  const paramCoachName =
    initialCoachName.trim() || (searchParams.get("coachName")?.trim() ?? "");
  const displayName =
    fromApp ? paramCoachName : (
      (sessionCoach?.fullName.trim() ?? paramCoachName)
    );

  // Fetch subscription & payment history when logged in
  useEffect(() => {
    if (!sessionCoach) return;
    let active = true;

    Promise.all([
      fetchCoachPremiumOffer().catch(() => null),
      fetchCoachPaymentHistory().catch(() => []),
    ]).then(([offerRes, historyRes]) => {
      if (!active) return;
      if (offerRes) setOffer(offerRes);
      if (historyRes) setHistory(historyRes);
      setFetchDone(true);
    });

    return () => {
      active = false;
    };
  }, [sessionCoach]);

  const loadingStatus = Boolean(sessionCoach) && !fetchDone && !offer;
  const isActiveSubscription =
    Boolean(offer?.isPaid) ||
    offer?.subscription?.status === "active" ||
    (Boolean(sessionCoach?.premiumPaid) && !offer);

  if (mounted && ready && sessionCoach && loadingStatus && !offer) {
    return <PremiumCheckoutSkeleton />;
  }

  if (mounted && ready && sessionCoach && isActiveSubscription) {
    const effectiveSubscription: CoachSubscriptionDetails =
      offer?.subscription ?? {
        status: "active",
        planName: offer?.planName ?? "",
        expiresOn: sessionCoach?.validUpto ?? null,
      };

    return (
      <>
        <RefreshPremiumStatus />
        <PremiumActiveView
          subscription={effectiveSubscription}
          history={history}
          displayName={displayName}
          coachCode={coachCode}
          coachId={coachId}
          plans={plans}
          promo={promo}
          initialPlanId={searchParams.get("planId") ?? ""}
        />
      </>
    );
  }

  return (
    <>
      <RefreshPremiumStatus />
      <PremiumCheckout
        key={`${coachId}:${coachCode}:${displayName}`}
        plans={plans}
        promo={promo}
        initialCoachId={coachId}
        initialCoachCode={coachCode}
        displayName={displayName}
        initialPlanId={searchParams.get("planId") ?? ""}
      />
    </>
  );
}
