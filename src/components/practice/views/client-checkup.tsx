"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { AssessmentFormState, AssessmentIds } from "@/types/practice";

import { AssessmentWizardLazy as AssessmentWizard } from "@/components/assessment/assessment-wizard-lazy";
import { useAuth } from "@/components/auth-provider";
import { PracticePageHeader } from "@/components/practice/page-header";
import { ClientCheckupSkeleton } from "@/components/skeletons/client-profile-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  fetchAuthedCoachProfile,
  fetchClientDetail,
  resolveCheckupAssessmentIds,
} from "@/lib/api/practice";
import { detailToForm } from "@/lib/assessment/map-detail";

export function ClientCheckupView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code ?? "");
  const { session } = useAuth();
  const [form, setForm] = useState<AssessmentFormState | null>(null);
  const [ids, setIds] = useState<AssessmentIds>({});
  const [countryCd, setCountryCd] = useState("IN");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void Promise.all([
        fetchClientDetail({ clientCode: code }),
        fetchAuthedCoachProfile().catch(() => null),
      ])
        .then(([detail, profile]) => {
          if (cancelled) return;
          setForm(detailToForm(detail));
          setIds(resolveCheckupAssessmentIds(detail));
          if (profile?.country_Cd) setCountryCd(profile.country_Cd);
        })
        .catch((err) => {
          if (!cancelled)
            setError(
              err instanceof Error ? err.message : "Could not load client.",
            );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [code]);

  const clientHref = `/dashboard/clients/${encodeURIComponent(code)}`;
  const clientName = form?.clientName?.trim() || "Client";

  if (!session?.coachCode) {
    return <p className="text-sm text-ink-muted">Sign in required.</p>;
  }

  if (loading) {
    return (
      <div className="min-w-0">
        {embedded ? null : (
          <PracticePageHeader
            title="Checkup"
            back={{ href: clientHref, label: "Back to client" }}
            description="Loading this client's checkup."
          />
        )}
        <ClientCheckupSkeleton />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-w-0 space-y-4">
        {embedded ? null : (
          <PracticePageHeader
            title="Checkup"
            back={{ href: clientHref, label: "Back to client" }}
            description="This checkup could not be opened."
          />
        )}
        <AlertBanner tone="error">{error ?? "Client not found."}</AlertBanner>
      </div>
    );
  }

  return (
    <div id="client-checkup" className="min-w-0">
      {embedded ?
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-ink">
          Checkup
        </h2>
      : null}
      <AssessmentWizard
        flow="checkup"
        embedded={embedded}
        title={clientName}
        description="Checkup. Update this assessment, then save it on their profile."
        back={
          embedded ? undefined : (
            {
              href: clientHref,
              label: `Back to ${clientName === "Client" ? "client" : clientName}`,
            }
          )
        }
        coachCode={session.coachCode}
        savedBy={session.fullName}
        countryCd={countryCd}
        initialForm={form}
        initialIds={ids}
      />
    </div>
  );
}
