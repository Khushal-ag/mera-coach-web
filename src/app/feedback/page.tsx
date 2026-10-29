import { Suspense } from "react";

import { FeedbackForm } from "@/components/feedback-form";
import { FeedbackFormSkeleton } from "@/components/skeletons/feedback-skeleton";
import { fetchFeedbackContext, isApiSuccess } from "@/lib/api";
import { decodeFeedbackToken } from "@/lib/feedback-crypto";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Feedback | Mera Coach",
  description:
    "Rate your coaching experience and share a short comment with your coach on Mera Coach.",
  path: "/feedback",
  noindex: true,
  absolute: true,
});

type SearchParams = Promise<{
  ref?: string;
  token?: string;
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
                <i className="fas fa-star" />
              </div>
              <div>
                <h1>Client Feedback</h1>
                <p>Share your experience with your wellness coach</p>
              </div>
            </div>
          </div>
          <div className="rg-card-body">
            <Suspense fallback={<FeedbackFormSkeleton />}>
              <FeedbackBody searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

async function FeedbackBody({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let coachCode = (params.coachCode ?? params.coachcode ?? "").trim();
  let clientCode = (params.clientCode ?? params.clientcode ?? "").trim();

  const refToken = (params.ref ?? params.token ?? "").trim();
  if (refToken) {
    const decoded = decodeFeedbackToken(refToken);
    if (decoded) {
      coachCode = decoded.coachCode;
      clientCode = decoded.clientCode;
    }
  }

  if (!coachCode || !clientCode) {
    return (
      <div className="rg-alert">
        <i className="fas fa-exclamation-circle" />
        <span>
          Open the link your coach shared. It needs both a coach and a client so
          we know who this feedback is for.
        </span>
      </div>
    );
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
