import { Suspense } from "react";
import Link from "next/link";

import type { Metadata } from "next";

import { AppHandoffCta } from "@/components/app-handoff-cta";
import { PageHero } from "@/components/page-hero";
import { AlertBanner } from "@/components/ui/alert-banner";
import { premiumPaidDeepLink } from "@/lib/app-deep-link";

export const metadata: Metadata = {
  title: "Premium activated",
  description: "Your Mera Coach premium subscription payment was confirmed.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  orderId?: string;
  plan?: string;
  periodEnd?: string;
  coachId?: string;
  coachCode?: string;
}>;

export default function PremiumSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Premium", href: "/premium" },
          { label: "Success" },
        ]}
        title="Premium activated"
        subtitle="Payment confirmed. Premium is active for Add Client and coaching tools on the web and in the app."
      />

      <section className="bg-[color:var(--mc-explore-canvas)] py-14">
        <div className="container max-w-xl">
          <Suspense fallback={<PremiumSuccessSkeleton />}>
            <PremiumSuccessBody searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function PremiumSuccessBody({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const periodLabel =
    params.periodEnd ?
      new Date(params.periodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const coachLabel = params.coachCode?.trim() || null;
  const fromApp =
    Boolean(params.coachId && Number(params.coachId) > 0) ||
    Boolean(coachLabel);
  const openAppHref = premiumPaidDeepLink();

  return (
    <div className="space-y-6">
      <AlertBanner tone="success">
        {params.plan ?
          <>
            <strong>{params.plan}</strong> is active
            {periodLabel ? ` through ${periodLabel}` : ""}
            {coachLabel ? ` for ${coachLabel}` : ""}.
          </>
        : "Your premium plan is active."}
      </AlertBanner>

      {params.orderId ?
        <p className="text-sm text-ink-muted">
          Order reference:{" "}
          <code className="rounded bg-paper-elevated px-1.5 py-0.5 text-xs">
            {params.orderId}
          </code>
        </p>
      : null}

      <AppHandoffCta
        href={openAppHref}
        autoRedirectMs={fromApp ? 2800 : 0}
        hint="You do not need to sign in on this website. If premium is not showing yet, pull to refresh your profile in the app."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {fromApp ?
          <Link
            href={
              coachLabel || params.coachId ?
                `/premium?${new URLSearchParams({
                  ...(params.coachId ? { coachId: params.coachId } : {}),
                  ...(coachLabel ? { coachCode: coachLabel } : {}),
                }).toString()}`
              : "/premium"
            }
            className="mc-btn-secondary w-full sm:w-auto"
          >
            Back to plans
          </Link>
        : <Link href="/premium" className="mc-btn-secondary w-full sm:w-auto">
            Back to plans
          </Link>
        }
      </div>
    </div>
  );
}

function PremiumSuccessSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading confirmation"
    >
      <div className="h-16 animate-pulse rounded-[var(--radius-md)] bg-line" />
      <div className="h-11 w-40 animate-pulse rounded-full bg-line" />
    </div>
  );
}
