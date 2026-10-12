import Link from "next/link";

import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { AlertBanner } from "@/components/ui/alert-banner";

export const metadata: Metadata = {
  title: "Premium activated",
  description: "Your Mera Coach premium subscription payment was confirmed.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  orderId?: string;
  plan?: string;
  periodEnd?: string;
}>;

export default async function PremiumSuccessPage({
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

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Premium", href: "/premium" },
          { label: "Success" },
        ]}
        title="Premium activated"
        subtitle="Thank you. Your payment was confirmed and premium access is ready in the Mera Coach app."
      />

      <section className="bg-paper py-14">
        <div className="container max-w-xl space-y-6">
          <AlertBanner tone="success">
            {params.plan ?
              <>
                <strong>{params.plan}</strong> is active
                {periodLabel ? ` through ${periodLabel}` : ""}.
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/premium" className="mc-btn-secondary w-full sm:w-auto">
              Back to plans
            </Link>
            <Link
              href="/coach-login"
              className="mc-btn-primary w-full sm:w-auto"
            >
              Coach login
            </Link>
          </div>

          <p className="text-sm text-ink-muted">
            Open the Mera Coach app to manage clients with your premium
            features. If the app still shows the paywall, pull to refresh your
            profile.
          </p>
        </div>
      </section>
    </>
  );
}
