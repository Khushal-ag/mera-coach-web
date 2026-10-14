import { Suspense } from "react";
import Link from "next/link";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { PremiumCheckoutAuth } from "@/components/premium-checkout-auth";
import { PremiumPlansSkeleton } from "@/components/skeletons/premium-plans-skeleton";
import { fetchPremiumPlans, firstApiError, isApiSuccess } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Premium | Mera Coach",
  description:
    "Grow your coaching business with Mera Coach Premium. Unlimited clients, packages, and coaching tools. Secure checkout on the website.",
  path: "/premium",
  absolute: true,
});

type SearchParams = Promise<{
  coachId?: string;
  coachCode?: string;
  reason?: string;
}>;

export default function PremiumPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mc-public">
      <div className="rg-page">
        <div className="rg-card">
          <div className="rg-card-head">
            <div className="rg-head-blobs">
              <div className="rg-hb rg-hb-1" />
              <div className="rg-hb rg-hb-2" />
            </div>
            <div className="rg-head-inner">
              <div className="rg-head-icon">
                <i className="fas fa-crown" />
              </div>
              <div>
                <h1>Premium</h1>
                <p>
                  Unlimited clients, packages, and the public page tools. One
                  plan, checkout on the website.
                </p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <Suspense fallback={<PremiumPlansSkeleton />}>
              <PremiumCatalog searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function PremiumCatalog({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialCoachId = Number(params.coachId ?? "0") || 0;
  const initialCoachCode = params.coachCode ?? "";
  const fromAddClient = params.reason === "add-client";

  let plans: CoachCatalogPlan[] = [];
  let promo: CoachSuggestedPromo | null | undefined = null;
  let features: string[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetchPremiumPlans();
    if (!isApiSuccess(response)) {
      errorMessage = firstApiError(response) ?? "Could not load plans.";
    } else {
      plans = response.responseObj?.plans ?? [];
      promo = response.responseObj?.promo;
      features = response.responseObj?.features ?? [];
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load plans.";
  }

  return (
    <div>
      {fromAddClient ?
        <div className="rg-info-note" style={{ marginBottom: 20 }}>
          <i className="fas fa-info-circle" />
          <div>Adding a client needs an active subscription.</div>
        </div>
      : null}
      {errorMessage ?
        <div className="rg-alert" style={{ marginBottom: 20 }}>
          <i className="fas fa-exclamation-circle" />
          <span>{errorMessage}</span>
        </div>
      : null}
      {features.length > 0 ?
        <ul className="rg-intro-items" style={{ marginBottom: 24 }}>
          {features.map((feature) => (
            <li key={feature} className="rg-ii">
              <div className="rg-ii-icon rg-ii-green">
                <i className="fas fa-check" />
              </div>
              <div className="rg-ii-body">
                <strong>{feature}</strong>
              </div>
            </li>
          ))}
        </ul>
      : plans.length === 0 && !errorMessage ?
        <p>No premium plans are available right now.</p>
      : null}
      <PremiumCheckoutAuth
        plans={plans}
        promo={promo}
        initialCoachId={initialCoachId}
        initialCoachCode={initialCoachCode}
      />
      <p className="rg-card-foot" style={{ marginTop: 24 }}>
        Pay Now in the app opens checkout for your account. On the web, sign in
        first. New here? <Link href="/register">Start as a Coach</Link>.
      </p>
    </div>
  );
}
