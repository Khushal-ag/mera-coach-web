import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Check, Crown } from "lucide-react";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { PageBanner } from "@/components/marketing/page-banner";
import { PremiumCheckoutAuth } from "@/components/premium-checkout-auth";
import { PremiumPlansSkeleton } from "@/components/skeletons/premium-plans-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { photography } from "@/config/photography";
import { fetchPremiumPlans, firstApiError, isApiSuccess } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Premium",
  description:
    "Grow your coaching business with Mera Coach Premium. Unlimited clients, packages, and coaching tools. Secure checkout on the website.",
  path: "/premium",
});

const FALLBACK_FEATURES = [
  "Unlimited client management",
  "Unlimited follow-ups and progress tracking",
  "Unlimited coaching packages",
  "Coach profile, gallery, photos and videos",
  "All Mera Coach features included",
] as const;

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
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Premium" }]}
        eyebrow="For coaches"
        title="Grow the practice with"
        emphasis="Premium"
        subtitle="Unlimited clients, packages, and the public page tools. One plan, checkout on the website."
      />
      <section className="bg-mc-secondary-light py-10 sm:py-14">
        <div className="container grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <aside className="space-y-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] shadow-[0_12px_36px_rgba(44,24,16,0.12)]">
              <Image
                src={photography.premium}
                alt="A quiet stretch in a coaching studio"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 380px"
              />
            </div>
            <div className="rounded-[22px] border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.06)] sm:p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]">
                  <Crown className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h2 className="font-display text-lg font-bold text-ink">
                  What you get
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {FALLBACK_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-mc-secondary"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    <span className="text-ink">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <Suspense fallback={<PremiumPlansSkeleton />}>
            <PremiumCatalog searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
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
    <div className="min-w-0">
      {fromAddClient ?
        <AlertBanner tone="info" className="mb-5">
          Adding a client needs an active subscription.
        </AlertBanner>
      : null}

      <div className="overflow-hidden rounded-[22px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8">
        {errorMessage ?
          <AlertBanner tone="error" className="mb-6">
            {errorMessage}
          </AlertBanner>
        : null}
        <PremiumCheckoutAuth
          plans={plans}
          promo={promo}
          initialCoachId={initialCoachId}
          initialCoachCode={initialCoachCode}
        />
      </div>
      <p className="mt-6 text-center text-sm text-ink-muted lg:text-left">
        Pay Now in the app opens checkout for your account. On the web, sign in
        first. New here?{" "}
        <Link href="/register" className="font-semibold text-mc-secondary">
          Start as a Coach
        </Link>
        .
      </p>
    </div>
  );
}
