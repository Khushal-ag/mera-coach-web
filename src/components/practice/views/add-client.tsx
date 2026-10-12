"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AssessmentWizardLazy as AssessmentWizard } from "@/components/assessment/assessment-wizard-lazy";
import { useAuth } from "@/components/auth-provider";
import {
  PracticePageHeader,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { isSubscriptionRequired } from "@/config/practice";
import {
  fetchAuthedCoachProfile,
  fetchCoachPremiumOffer,
} from "@/lib/api/practice";

export function AddClientView() {
  const { session } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<
    "checking" | "ready" | "blocked" | "check-failed"
  >("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [countryCd, setCountryCd] = useState("IN");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!isSubscriptionRequired()) {
        if (!cancelled) setStatus("ready");
        return;
      }
      void fetchCoachPremiumOffer()
        .then((offer) => {
          if (cancelled) return;
          if (offer.isPaid) setStatus("ready");
          else {
            setStatus("blocked");
            const qs = new URLSearchParams();
            if (session?.coachId) qs.set("coachId", String(session.coachId));
            if (session?.coachCode) qs.set("coachCode", session.coachCode);
            qs.set("reason", "add-client");
            router.replace(`/premium?${qs.toString()}`);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStatus("check-failed");
            setMessage(
              err instanceof Error ?
                err.message
              : "Could not check subscription. Try again.",
            );
          }
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router, session?.coachCode, session?.coachId]);

  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchAuthedCoachProfile()
        .then((p) => {
          if (!cancelled && p?.country_Cd) setCountryCd(p.country_Cd);
        })
        .catch(() => undefined);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [status]);

  if (status === "checking" || status === "blocked") {
    return (
      <div aria-busy="true">
        <span className="sr-only">
          {status === "blocked" ? "Redirecting to Premium" : "Checking access"}
        </span>
        <PracticeRosterSkeleton rows={4} />
      </div>
    );
  }

  if (status === "check-failed") {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <PracticePageHeader
          title="Add client"
          description="We could not verify your Premium status."
        />
        {message ?
          <AlertBanner tone="error">{message}</AlertBanner>
        : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="mc-btn-primary"
            onClick={() => {
              setStatus("checking");
              setMessage(null);
              void fetchCoachPremiumOffer()
                .then((offer) => {
                  if (offer.isPaid) setStatus("ready");
                  else {
                    setStatus("blocked");
                    const qs = new URLSearchParams();
                    if (session?.coachId)
                      qs.set("coachId", String(session.coachId));
                    if (session?.coachCode)
                      qs.set("coachCode", session.coachCode);
                    qs.set("reason", "add-client");
                    router.replace(`/premium?${qs.toString()}`);
                  }
                })
                .catch((err) => {
                  setStatus("check-failed");
                  setMessage(
                    err instanceof Error ?
                      err.message
                    : "Could not check subscription. Try again.",
                  );
                });
            }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="mc-btn-secondary inline-flex items-center"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!session?.coachCode) {
    return <p className="text-sm text-ink-muted">Sign in required.</p>;
  }

  return (
    <AssessmentWizard
      flow="add"
      title="Add client"
      coachCode={session.coachCode}
      savedBy={session.fullName}
      countryCd={countryCd}
    />
  );
}
