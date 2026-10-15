"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AssessmentWizardLazy as AssessmentWizard } from "@/components/assessment/assessment-wizard-lazy";
import { useAuth } from "@/components/auth-provider";
import { PracticePageHeader } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { isSubscriptionRequired } from "@/config/practice";
import { ADD_CLIENT_PREMIUM_HREF } from "@/constants/routes";
import { fetchAuthedCoachProfile } from "@/lib/api/practice";
import { ensurePremiumStatus } from "@/lib/auth/premium-status";

function subscriptionError(err: unknown) {
  return err instanceof Error ?
      err.message
    : "Could not check subscription. Try again.";
}

export function AddClientView() {
  const { session } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [countryCd, setCountryCd] = useState("IN");
  const required = isSubscriptionRequired();
  const paid = session?.premiumPaid;
  const allowed = !required || paid === true;

  useEffect(() => {
    if (!required || paid !== false) return;
    router.replace(ADD_CLIENT_PREMIUM_HREF);
  }, [paid, required, router]);

  useEffect(() => {
    if (!required || typeof paid === "boolean") return;
    let cancelled = false;
    void ensurePremiumStatus()
      .then((next) => {
        if (cancelled || next !== false) return;
        router.replace(ADD_CLIENT_PREMIUM_HREF);
      })
      .catch((err) => {
        if (!cancelled) setMessage(subscriptionError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, paid, required, router]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchAuthedCoachProfile()
        .then((profile) => {
          if (!cancelled && profile?.country_Cd)
            setCountryCd(profile.country_Cd);
        })
        .catch(() => undefined);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [allowed]);

  if (required && paid === false) return null;

  if (required && typeof paid !== "boolean") {
    if (!message) return null;
    return (
      <div className="min-w-0 space-y-4">
        <PracticePageHeader
          title="New Client"
          crumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Clients", href: "/dashboard/clients" },
            { label: "Add client" },
          ]}
          description="We could not verify your Premium status."
        />
        <AlertBanner tone="error">{message}</AlertBanner>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="mc-btn-primary w-full sm:w-auto"
            onClick={() => {
              setMessage(null);
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </button>
          <Link href="/dashboard" className="mc-btn-secondary w-full sm:w-auto">
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
      title="New Client"
      description="Fill each section, then save it on the client."
      back={{ href: "/dashboard/clients", label: "Back to clients" }}
      coachCode={session.coachCode}
      savedBy={session.fullName}
      countryCd={countryCd}
      finishRedirect={(ids) =>
        ids.clientCode ?
          `/dashboard/clients/${encodeURIComponent(ids.clientCode)}`
        : "/dashboard/clients"
      }
    />
  );
}
