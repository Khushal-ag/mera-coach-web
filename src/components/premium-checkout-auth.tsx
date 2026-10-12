"use client";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { useAuth } from "@/components/auth-provider";
import { PremiumCheckout } from "@/components/premium-checkout";

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
