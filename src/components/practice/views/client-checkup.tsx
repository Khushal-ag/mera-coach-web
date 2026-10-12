"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import type { AssessmentFormState, AssessmentIds } from "@/types/practice";

import { AssessmentWizardLazy as AssessmentWizard } from "@/components/assessment/assessment-wizard-lazy";
import { useAuth } from "@/components/auth-provider";
import { PracticeRosterSkeleton } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  fetchAuthedCoachProfile,
  fetchClientDetail,
  resolveCheckupAssessmentIds,
} from "@/lib/api/practice";
import { detailToForm } from "@/lib/assessment/map-detail";

export function ClientCheckupView() {
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

  if (!session?.coachCode) {
    return <p className="text-sm text-ink-muted">Sign in required.</p>;
  }

  if (loading) {
    return <PracticeRosterSkeleton rows={4} />;
  }

  if (error || !form) {
    return (
      <div className="space-y-4">
        <AlertBanner tone="error">{error ?? "Client not found."}</AlertBanner>
        <Link
          href="/dashboard/checkups"
          className="inline-flex items-center gap-1 text-sm font-semibold text-mc-secondary"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to checkups
        </Link>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-4">
        <Link
          href={`/dashboard/clients/${encodeURIComponent(code)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Client profile
        </Link>
      </nav>
      <AssessmentWizard
        flow="checkup"
        title={`Checkup for ${form.clientName || code}`}
        coachCode={session.coachCode}
        savedBy={session.fullName}
        countryCd={countryCd}
        initialForm={form}
        initialIds={ids}
      />
    </div>
  );
}
