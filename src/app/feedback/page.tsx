import type { Metadata } from "next";

import { FeedbackForm } from "@/components/feedback-form";
import { fetchFeedbackContext, isApiSuccess } from "@/lib/api";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share quick feedback for your coach on Mera Coach.",
};

type SearchParams = Promise<{
  coachCode?: string;
  clientCode?: string;
  coachcode?: string;
  clientcode?: string;
}>;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
    <section className="bg-mc-explore py-10 sm:py-16 lg:py-24">
      <div className="container max-w-lg">
        <div className="mc-card p-5 sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Share feedback
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Quick feedback for your coach: a few stars and optional comments.
          </p>
          <div className="mt-8">
            <FeedbackForm
              coachCode={coachCode}
              clientCode={clientCode}
              coachName={coachName}
              clientName={clientName}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
