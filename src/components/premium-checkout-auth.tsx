"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { useAuth } from "@/components/auth-provider";
import { RefreshPremiumStatus } from "@/components/refresh-premium-status";
import { PremiumCheckoutSkeleton } from "@/components/skeletons/premium-plans-skeleton";
import { useMounted } from "@/hooks/use-mounted";

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
};

/**
 * Checkout identity comes from the signed-in session, or from the app Pay Now
 * link (`coachId` / `coachCode`). Anonymous visits with neither go to login.
 * The coach code is never an editable field.
 */
export function PremiumCheckoutAuth({
  plans,
  promo,
  initialCoachId = 0,
  initialCoachCode = "",
}: Props) {
  const { session, ready } = useAuth();
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  // after mount, so the plan catalog paints without reading sessionStorage.
  const sessionCoach = mounted && ready && session ? session : null;
  const coachId =
    fromApp ? initialCoachId
    : sessionCoach && sessionCoach.coachId > 0 ? sessionCoach.coachId
    : 0;
  const coachCode =
    fromApp ? initialCoachCode.trim()
    : sessionCoach?.coachCode.trim() ? sessionCoach.coachCode.trim()
    : "";
  const displayName = fromApp ? "" : (sessionCoach?.fullName.trim() ?? "");

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
      />
    </>
  );
}
