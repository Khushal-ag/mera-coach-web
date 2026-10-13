import { Suspense } from "react";

import { FeedbackForm } from "@/components/feedback-form";
import { PageBanner } from "@/components/marketing/page-banner";
import { fetchFeedbackContext, isApiSuccess } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Feedback",
  description: "Share quick feedback for your coach on Mera Coach.",
  path: "/feedback",
});

type SearchParams = Promise<{
  coachCode?: string;
  clientCode?: string;
  coachcode?: string;
  clientcode?: string;
}>;

export default function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Feedback" }]}
        title="Share"
        emphasis="feedback"
        subtitle="A few stars and optional comments for your coach."
      />
      <section className="bg-[color:var(--mc-explore-canvas)] py-10 sm:py-14">
        <div className="container max-w-lg">
          <div className="rounded-[22px] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(23,134,118,0.08)] sm:p-8">
            <Suspense fallback={<FeedbackFormSkeleton />}>
              <FeedbackBody searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}

async function FeedbackBody({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const coachCode = params.coachCode ?? params.coachcode ?? "";
  const clientCode = params.clientCode ?? params.clientcode ?? "";

  let coachName: string | undefined;
  let clientName: string | undefined;

  if (coachCode && clientCode) {
    try {
      const context = await fetchFeedbackContext({ coachCode, clientCode });
      if (isApiSuccess(context) && context.responseObj) {
        coachName = context.responseObj.coachName || undefined;
        clientName = context.responseObj.clientName || undefined;
      }
    } catch {
      // Form still works; context is optional enrichment.
    }
  }

  return (
    <FeedbackForm
      coachCode={coachCode}
      clientCode={clientCode}
      coachName={coachName}
      clientName={clientName}
    />
  );
}

function FeedbackFormSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading feedback">
      <div className="h-6 w-32 animate-pulse rounded bg-line" />
      <div className="h-11 animate-pulse rounded-[10px] bg-line" />
      <div className="h-11 animate-pulse rounded-[10px] bg-line" />
      <div className="h-24 animate-pulse rounded-[10px] bg-line" />
      <div className="h-12 animate-pulse rounded-full bg-line" />
    </div>
  );
}
