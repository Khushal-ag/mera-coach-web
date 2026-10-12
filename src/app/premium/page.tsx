import Link from "next/link";

import type { Metadata } from "next";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { PageHero } from "@/components/page-hero";
import { PremiumCheckout } from "@/components/premium-checkout";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchPremiumPlans, firstApiError, isApiSuccess } from "@/lib/api";

export const metadata: Metadata = {
  title: "Premium",
  description:
    "Upgrade your Mera Coach account with premium plans. Checkout stays on the website via Razorpay.",
};

type SearchParams = Promise<{
  coachId?: string;
  coachCode?: string;
}>;

export default async function PremiumPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialCoachId = Number(params.coachId ?? "0") || 0;
  const initialCoachCode = params.coachCode ?? "";

  let plans: CoachCatalogPlan[] = [];
  let promo: CoachSuggestedPromo | null | undefined = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetchPremiumPlans();
    if (!isApiSuccess(response)) {
      errorMessage = firstApiError(response) ?? "Could not load plans.";
    } else {
      plans = response.responseObj?.plans ?? [];
      promo = response.responseObj?.promo;
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load plans.";
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Premium" }]}
        title={
          <>
            Mera Coach{" "}
            <span className="text-[color:var(--mc-brand-coach)]">Premium</span>
          </>
        }
        subtitle="Payment stays on the website. Open this page from the app Pay Now button, choose a plan, and complete checkout with Razorpay. Prices always come from the live API."
      />

      <section className="bg-paper py-10 sm:py-14 lg:py-16">
        <div className="container max-w-3xl">
          <div className="mc-card p-5 sm:p-8">
            {errorMessage ?
              <AlertBanner tone="error" className="mb-6">
                {errorMessage}
              </AlertBanner>
            : null}
            <PremiumCheckout
              key={`${initialCoachId}:${initialCoachCode}`}
              plans={plans}
              promo={promo}
              initialCoachId={initialCoachId}
              initialCoachCode={initialCoachCode}
            />
          </div>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Need an account first?{" "}
            <Link
              href="/register"
              className="font-semibold text-mc-brand-coach"
            >
              Register as a coach
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
