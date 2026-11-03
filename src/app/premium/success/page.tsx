import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { AppHandoffCta } from "@/components/app-handoff-cta";
import { PageBanner } from "@/components/marketing/page-banner";
import { RefreshPremiumStatus } from "@/components/refresh-premium-status";
import { AlertBanner } from "@/components/ui/alert-banner";
import { isSubscriptionRequired } from "@/config/practice";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";
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
  coachName?: string;
}>;

export default function PremiumSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isSubscriptionRequired()) {
    redirect("/dashboard");
  }

  return (
    <>
      <PageBanner
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Premium", href: "/premium" },
          { label: "Success" },
        ]}
        title="Premium"
        emphasis="activated"
        subtitle="Payment confirmed. Premium is active for Add Client and coaching tools on the web and in the app."
      />

      <section className="bg-mc-secondary-light py-10 sm:py-14">
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

  let coachDisplayName = params.coachName?.trim() || null;
  if (!coachDisplayName && (params.coachId || params.coachCode)) {
    try {
      const profileRes = await fetchCoachProfile({
        coachId: params.coachId ? Number(params.coachId) : undefined,
        coachCode: params.coachCode,
      });
      if (isApiSuccess(profileRes) && profileRes.responseObj?.coachName) {
        coachDisplayName = profileRes.responseObj.coachName;
      }
    } catch {
      // Best-effort lookup
    }
  }

  const coachNotice =
    coachDisplayName ? coachDisplayName
    : coachLabel ? `your Coach account (${coachLabel.toUpperCase()})`
    : "your Coach account";

  return (
    <div className="space-y-6 rounded-[22px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8">
      <RefreshPremiumStatus />
      <AlertBanner tone="success">
        {params.plan ?
          <>
            <strong>{params.plan}</strong> is active
            {periodLabel ? ` through ${periodLabel}` : ""} for{" "}
            <strong>{coachNotice}</strong>.
          </>
        : <>
            Your premium plan is active for <strong>{coachNotice}</strong>.
          </>
        }
      </AlertBanner>

      <div className="rounded-2xl border border-line bg-[#FAF7F2] p-4 sm:p-5">
        <h2 className="mb-3 text-xs font-semibold tracking-wider text-ink-muted uppercase">
          Subscription Summary
        </h2>
        <dl className="space-y-2.5 text-sm">
          {params.plan ?
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Plan</dt>
              <dd className="font-semibold text-ink">{params.plan}</dd>
            </div>
          : null}
          {periodLabel ?
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Valid Through</dt>
              <dd className="font-medium text-ink">{periodLabel}</dd>
            </div>
          : null}
          {params.orderId ?
            <div className="flex flex-col gap-1 border-t border-line/60 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-ink-muted">Payment Reference</dt>
              <dd className="font-mono text-xs font-medium break-all text-ink select-all sm:break-normal">
                {params.orderId}
              </dd>
            </div>
          : null}
        </dl>
      </div>

      <AppHandoffCta
        href={openAppHref}
        autoRedirectMs={fromApp ? 2800 : 0}
        hint="Your premium membership is active. Open the Mera Coach app to start adding clients and access all coaching features."
        refreshTip="Tip: If the app is already open, pull down on your profile screen to refresh your subscription status."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {fromApp ?
          <Link
            href={
              coachLabel || params.coachId ?
                `/premium?${new URLSearchParams({
                  ...(params.coachId ? { coachId: params.coachId } : {}),
                  ...(coachLabel ? { coachCode: coachLabel } : {}),
                  ...(coachDisplayName ? { coachName: coachDisplayName } : {}),
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
