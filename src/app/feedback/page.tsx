import { Suspense } from "react";
import Link from "next/link";

import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackFormSkeleton } from "@/components/skeletons/feedback-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
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
    <section className="bg-[color:var(--mc-explore-canvas)] py-8 sm:py-14">
      <div className="container max-w-[45rem]">
        <header>
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center hover:text-mc-secondary"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li className="font-semibold text-ink">Feedback</li>
            </ol>
          </nav>
          <h1 className="mt-3 font-display text-[2rem] leading-[1.15] font-extrabold text-balance text-mc-secondary sm:text-4xl">
            How was your coaching?
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
            A rating and a few words for your coach. It only takes a minute.
          </p>
          <div
            className="mt-5 h-1 w-12 rounded-full bg-mc-accent"
            aria-hidden
          />
        </header>

        <div className="mt-8">
          <Suspense fallback={<FeedbackFormSkeleton />}>
            <FeedbackBody searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

async function FeedbackBody({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const coachCode = (params.coachCode ?? params.coachcode ?? "").trim();
  const clientCode = (params.clientCode ?? params.clientcode ?? "").trim();

  if (!coachCode || !clientCode) {
    return <IncompleteFeedbackLink />;
  }

  let coachName: string | undefined;
  let clientName: string | undefined;

  try {
    const context = await fetchFeedbackContext({ coachCode, clientCode });
    if (isApiSuccess(context) && context.responseObj) {
      coachName = context.responseObj.coachName || undefined;
      clientName = context.responseObj.clientName || undefined;
    }
  } catch {
    // Form still works; names are optional enrichment.
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

function IncompleteFeedbackLink() {
  return (
    <div className="rounded-[22px] border border-line bg-white px-4 py-8 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:px-10 sm:py-12">
      <h2 className="font-display text-2xl font-extrabold text-mc-secondary">
        This link is incomplete
      </h2>
      <AlertBanner tone="error" className="mt-5">
        Open the link your coach shared. It needs both a coach and a client so
        we know who this feedback is for.
      </AlertBanner>
    </div>
  );
}
