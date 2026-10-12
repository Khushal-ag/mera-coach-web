"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ArrowLeft, Download, Sparkles } from "lucide-react";

import type {
  AssessmentFormState,
  AssessmentIds,
  GeneratedDietPlan,
} from "@/types/practice";

import { AssessmentWizard } from "@/components/assessment/assessment-wizard";
import { useAuth } from "@/components/auth-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { downloadAuthedPdf } from "@/lib/api/pdf";
import {
  fetchAuthedCoachProfile,
  fetchClientDetail,
  fetchDietPlanReport,
} from "@/lib/api/practice";
import { detailToForm } from "@/lib/assessment/map-detail";
import { formatBmi } from "@/lib/bmi";

export default function ClientDietPlanPage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code ?? "");
  const { session } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<GeneratedDietPlan | null>(null);
  const [form, setForm] = useState<AssessmentFormState | null>(null);
  const [ids, setIds] = useState<AssessmentIds>({});
  const [countryCd, setCountryCd] = useState("IN");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!session?.coachCode || !code) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void Promise.all([
        fetchClientDetail({ clientCode: code }),
        fetchDietPlanReport({ coachCode, clientCode: code }),
        fetchAuthedCoachProfile().catch(() => null),
      ])
        .then(([detail, diet, profile]) => {
          if (cancelled) return;
          const mapped = detailToForm(detail);
          if (diet) mapped.dietPlan = diet;
          setForm(mapped);
          setIds({
            clientCode: detail.clientCode,
            assessmentCode: detail.assessmentCode,
          });
          setPlan(diet);
          if (profile?.country_Cd) setCountryCd(profile.country_Cd);
        })
        .catch((err) => {
          if (!cancelled)
            setError(
              err instanceof Error ? err.message : "Could not load diet plan.",
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
  }, [session?.coachCode, code]);

  async function onPdf() {
    if (!session?.coachCode) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await downloadAuthedPdf(
        "v1/Client/diet-plan-pdf",
        {
          coachCode: session.coachCode,
          clientCode: code,
        },
        "diet-plan.pdf",
      );
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Could not download PDF.",
      );
    } finally {
      setPdfBusy(false);
    }
  }

  if (!session?.coachCode) {
    return <p className="text-sm text-ink-muted">Sign in required.</p>;
  }

  if (editing && form) {
    return (
      <div>
        <nav className="mb-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
            onClick={() => setEditing(false)}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to report
          </button>
        </nav>
        <AssessmentWizard
          flow="dietPlan"
          title="Generate diet plan"
          coachCode={session.coachCode}
          savedBy={session.fullName}
          countryCd={countryCd}
          initialForm={form}
          initialIds={ids}
          finishRedirect={(next) =>
            `/dashboard/clients/${encodeURIComponent(next.clientCode || code)}/diet`
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <nav className="mb-4 print:hidden">
        <Link
          href={`/dashboard/clients/${encodeURIComponent(code)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Client
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Diet plan
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {form?.clientName || code}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            className="mc-btn-secondary"
            onClick={() => window.print()}
          >
            Print
          </button>
          {plan ?
            <button
              type="button"
              className="mc-btn-secondary"
              disabled={pdfBusy}
              onClick={() => void onPdf()}
            >
              <Download className="size-4" aria-hidden />
              {pdfBusy ? "Preparing…" : "Download PDF"}
            </button>
          : null}
          <button
            type="button"
            className="mc-btn-primary"
            onClick={() => setEditing(true)}
          >
            <Sparkles className="size-4" aria-hidden />
            {plan ? "Regenerate" : "Generate plan"}
          </button>
        </div>
      </header>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {pdfError ?
        <AlertBanner tone="error">{pdfError}</AlertBanner>
      : null}

      {loading ?
        <p className="text-sm text-ink-muted">Loading diet plan…</p>
      : !plan ?
        <div className="rounded-[var(--radius-sm)] border border-line bg-surface p-6">
          <p className="text-sm text-ink-muted">
            No saved diet plan yet. Generate one from the client assessment.
          </p>
          <button
            type="button"
            className="mc-btn-primary mt-4"
            onClick={() => setEditing(true)}
          >
            Generate AI diet plan
          </button>
        </div>
      : <div className="space-y-5">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <dt className="text-xs text-ink-muted">Daily target</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {plan.summary.dailyCalTarget || "-"} kcal
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <dt className="text-xs text-ink-muted">BMI category</dt>
              <dd className="font-display text-xl font-bold">
                {plan.summary.bmiCategory || "-"}
              </dd>
            </div>
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <dt className="text-xs text-ink-muted">BMI</dt>
              <dd className="font-display text-xl font-bold tabular-nums">
                {plan.summary.bmi ? formatBmi(plan.summary.bmi) : "-"}
              </dd>
            </div>
          </dl>

          <section className="space-y-2 rounded-[var(--radius-sm)] border border-line bg-surface p-5 text-sm">
            {plan.recommendations.waterIntake ?
              <p>
                <span className="font-semibold">Water: </span>
                {plan.recommendations.waterIntake}
              </p>
            : null}
            {plan.recommendations.foodsToAvoid ?
              <p>
                <span className="font-semibold">Avoid: </span>
                {plan.recommendations.foodsToAvoid}
              </p>
            : null}
            {plan.recommendations.supplements ?
              <p>
                <span className="font-semibold">Supplements: </span>
                {plan.recommendations.supplements}
              </p>
            : null}
            {plan.recommendations.healthTips ?
              <p>
                <span className="font-semibold">Tips: </span>
                {plan.recommendations.healthTips}
              </p>
            : null}
          </section>

          <ul className="divide-y divide-line rounded-[var(--radius-sm)] border border-line bg-surface">
            {plan.weeklyPlan.map((meal, i) => (
              <li key={`${meal.mealType}-${i}`} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">{meal.mealType}</p>
                  <p className="text-xs text-ink-muted">
                    {meal.mealTime}
                    {meal.calMin || meal.calMax ?
                      ` · ${meal.calMin}-${meal.calMax} kcal`
                    : ""}
                  </p>
                </div>
                {meal.options.length ?
                  <ul className="mt-2 list-inside list-disc text-sm text-ink-muted">
                    {meal.options.map((opt) => (
                      <li key={opt}>{opt}</li>
                    ))}
                  </ul>
                : null}
                {meal.tip ?
                  <p className="mt-1 text-xs text-ink-muted">{meal.tip}</p>
                : null}
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="text-sm font-semibold text-mc-secondary hover:underline print:hidden"
            onClick={() => router.refresh()}
          >
            Refresh
          </button>
        </div>
      }
    </div>
  );
}
