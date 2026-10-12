"use client";

import dynamic from "next/dynamic";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { useAuth } from "@/components/auth-provider";

const PremiumCheckout = dynamic(
  () =>
    import("@/components/premium-checkout").then((mod) => mod.PremiumCheckout),
  {
    loading: () => (
      <div className="space-y-3" aria-busy="true" aria-label="Loading checkout">
        <div className="h-8 w-40 animate-pulse rounded bg-line" />
        <div className="h-24 animate-pulse rounded-[var(--radius-md)] bg-line" />
        <div className="h-12 animate-pulse rounded-full bg-line" />
      </div>
    ),
  },
);

type Props = {
  plans: CoachCatalogPlan[];
  promo?: CoachSuggestedPromo | null;
  initialCoachId?: number;
  initialCoachCode?: string;
};

/**
 * Prefer deep-link coach identity; otherwise prefill from the signed-in web session.
 */
export function PremiumCheckoutAuth({
  plans,
  promo,
  initialCoachId = 0,
  initialCoachCode = "",
}: Props) {
  const { session, ready } = useAuth();

  const fromQuery = initialCoachId > 0 || Boolean(initialCoachCode.trim());
  const coachId = fromQuery ? initialCoachId : (session?.coachId ?? 0);
  const coachCode = fromQuery ? initialCoachCode : (session?.coachCode ?? "");

  if (!ready && !fromQuery) {
    return (
      <p className="text-sm text-ink-muted" aria-live="polite">
        Checking your coach session…
      </p>
    );
  }

  return (
    <PremiumCheckout
      key={`${coachId}:${coachCode}:${ready ? "ready" : "wait"}`}
      plans={plans}
      promo={promo}
      initialCoachId={coachId}
      initialCoachCode={coachCode}
    />
  );
}
