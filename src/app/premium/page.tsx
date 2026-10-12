import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Check, Crown } from "lucide-react";

import type { CoachCatalogPlan, CoachSuggestedPromo } from "@/types/premium";

import { PageHero } from "@/components/page-hero";
import { PremiumCheckoutAuth } from "@/components/premium-checkout-auth";
import { AlertBanner } from "@/components/ui/alert-banner";
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
      <PageHero
        variant="photo"
        crumbs={[{ label: "Home", href: "/" }, { label: "Premium" }]}
        title={
          <>
            Grow your coaching business with{" "}
            <span className="text-[color:var(--mc-brand-coach)]">
              Mera Coach
            </span>
          </>
        }
        subtitle="All the tools you need. One simple plan. No limits. Just focus on your clients."
      />

      <section className="bg-[color:var(--mc-explore-canvas)] py-12 sm:py-16 lg:py-20">
        <div className="container max-w-6xl">
          <Suspense fallback={<PremiumCatalogSkeleton />}>
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
  let catalogFeatures: string[] = [];
  let errorMessage: string | null = null;

  try {
    const response = await fetchPremiumPlans();
    if (!isApiSuccess(response)) {
      errorMessage = firstApiError(response) ?? "Could not load plans.";
    } else {
      plans = response.responseObj?.plans ?? [];
      promo = response.responseObj?.promo;
      const fromCatalog = response.responseObj?.features;
      if (Array.isArray(fromCatalog) && fromCatalog.length > 0) {
        catalogFeatures = fromCatalog.map(String);
      }
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load plans.";
  }

  const features =
    catalogFeatures.length > 0 ? catalogFeatures : [...FALLBACK_FEATURES];

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
      <aside className="space-y-6">
        <div className="relative hidden overflow-hidden rounded-[var(--radius-lg)] lg:block">
          <div className="relative aspect-[4/5]">
            <Image
              src="/mc-images/coach-guidance.jpg"
              alt="Personal trainer coaching a client in the gym"
              fill
              className="object-cover object-[center_15%]"
              sizes="400px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[color:var(--mc-header-bottom)]/80 via-transparent to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="font-display text-xl font-bold">
                Focus on your clients
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Unlimited client management, packages, and the profile tools
                that grow your coaching business.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[color:var(--mc-accent-light)] text-[color:var(--mc-brand-coach)]">
              <Crown className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">
              What you get
            </h2>
          </div>
          <ul className="mt-5 divide-y divide-line border-t border-line">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 py-3 text-sm first:pt-4"
              >
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

      <div className="min-w-0">
        {fromAddClient ?
          <AlertBanner tone="info" className="mb-5">
            Premium is required to add clients. Choose a plan below to unlock
            Add Client for your coaching.
          </AlertBanner>
        : null}

        <div className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-4 shadow-[0_12px_32px_rgba(0,75,62,0.06)] sm:p-8">
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
          Signed in? Premium uses your coach account automatically. New here?{" "}
          <Link href="/register" className="font-semibold text-mc-brand-coach">
            Start as a Coach
          </Link>{" "}
          or{" "}
          <Link
            href="/coach-login"
            className="font-semibold text-mc-brand-coach"
          >
            Coach login
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function PremiumCatalogSkeleton() {
  return (
    <div
      className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12"
      aria-busy="true"
      aria-label="Loading Premium"
    >
      <div className="space-y-6">
        <div className="hidden aspect-[4/5] animate-pulse rounded-[var(--radius-lg)] bg-line lg:block" />
        <div className="h-72 animate-pulse rounded-[var(--radius-md)] bg-line" />
      </div>
      <div className="h-[28rem] animate-pulse rounded-[var(--radius-md)] bg-line" />
    </div>
  );
}
