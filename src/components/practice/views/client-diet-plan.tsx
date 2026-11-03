"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import type {
  AssessmentFormState,
  AssessmentIds,
  GeneratedDietPlan,
} from "@/types/practice";

import { AssessmentWizardLazy as AssessmentWizard } from "@/components/assessment/assessment-wizard-lazy";
import { useAuth } from "@/components/auth-provider";
import { EmptyState } from "@/components/practice/empty-state";
import { PracticePageHeader } from "@/components/practice/page-header";
import { ClientDietSkeleton } from "@/components/skeletons/client-profile-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { downloadAuthedPdf, PDF_PATH } from "@/lib/api/pdf";
import {
  fetchAuthedCoachProfile,
  fetchClientDetail,
  fetchDietPlanReport,
} from "@/lib/api/practice";
import { detailToForm } from "@/lib/assessment/map-detail";
import { formatBmi } from "@/lib/bmi";

export function ClientDietPlanView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
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
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [session?.coachCode, code, reloadKey]);

  async function onPdf() {
    if (!session?.coachCode) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await downloadAuthedPdf(
        PDF_PATH.dietPlan,
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

  const clientName = form?.clientName?.trim() || "Client";
  const clientHref = `/dashboard/clients/${encodeURIComponent(code)}`;

  if (editing && form) {
    return (
      <div className="min-w-0">
        {embedded ?
          <button
            type="button"
            className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary hover:underline"
            onClick={() => setEditing(false)}
          >
            Back to plan
          </button>
        : null}
        <AssessmentWizard
          flow="dietPlan"
          embedded={embedded}
          title="Diet plan"
          description={
            clientName === "Client" ?
              "Generate a plan from this client's assessment."
            : `Generate a plan from ${clientName}'s assessment.`
          }
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
          onFinished={() => {
            setEditing(false);
            setReloadKey((n) => n + 1);
          }}
        />
      </div>
    );
  }

  const description =
    clientName === "Client" ?
      "Meals and targets saved for this client."
    : `Meals and targets saved for ${clientName}.`;
  const planActions = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end print:hidden">
      {plan ?
        <button
          type="button"
          className="mc-btn-secondary w-full sm:w-auto"
          onClick={() => window.print()}
        >
          Print
        </button>
      : null}
      {plan ?
        <button
          type="button"
          className="mc-btn-secondary w-full sm:w-auto"
          disabled={pdfBusy}
          onClick={() => void onPdf()}
        >
          <i className="fas fa-download" style={{ fontSize: 16 }} aria-hidden />
          {pdfBusy ? "Preparing…" : "Download PDF"}
        </button>
      : null}
      {plan ?
        <button
          type="button"
          className="mc-btn-primary w-full sm:w-auto"
          onClick={() => setEditing(true)}
        >
          <i className="fas fa-magic" style={{ fontSize: 16 }} aria-hidden />
          Regenerate
        </button>
      : null}
    </div>
  );

  return (
    <div className="min-w-0 print:max-w-none">
      {embedded ?
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Diet plan
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          </div>
          {planActions}
        </div>
      : <PracticePageHeader
          title="Diet plan"
          back={{
            href: clientHref,
            label: `Back to ${clientName === "Client" ? "client" : clientName}`,
          }}
          description={description}
          action={planActions}
        />
      }

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {pdfError ?
        <AlertBanner tone="error">{pdfError}</AlertBanner>
      : null}

      {loading ?
        <ClientDietSkeleton />
      : !plan ?
        <EmptyState
          icon="fas fa-utensils"
          title="No diet plan yet"
          description={`Generate a personalised daily calorie target and meal plan for ${clientName === "Client" ? "this client" : clientName} from their saved assessment.`}
          action={
            <button
              type="button"
              className="mc-btn-primary"
              onClick={() => setEditing(true)}
            >
              <i
                className="fas fa-magic"
                style={{ fontSize: 16 }}
                aria-hidden
              />
              Generate plan
            </button>
          }
        />
      : <div className="space-y-6">
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.7fr)]">
            <div className="flex min-h-[10rem] flex-col justify-between rounded-2xl bg-mc-secondary px-6 py-6 text-white">
              <p className="font-display text-sm font-semibold text-white/80">
                Daily target
              </p>
              <p className="mt-3 font-display text-6xl leading-none font-bold tabular-nums">
                {plan.summary.dailyCalTarget || "-"}
              </p>
              <p className="mt-3 text-sm text-white/75">kcal</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="mc-panel px-5 py-4">
                <p className="text-sm text-ink-muted">BMI category</p>
                <p className="mt-1 font-display text-2xl font-bold text-ink">
                  {plan.summary.bmiCategory || "-"}
                </p>
              </div>
              <div className="mc-panel px-5 py-4">
                <p className="text-sm text-ink-muted">BMI</p>
                <p className="mt-1 font-display text-2xl font-bold text-mc-secondary tabular-nums">
                  {plan.summary.bmi ? formatBmi(plan.summary.bmi) : "-"}
                </p>
              </div>
            </div>
          </div>

          {(
            plan.recommendations.waterIntake ||
            plan.recommendations.foodsToAvoid ||
            plan.recommendations.supplements ||
            plan.recommendations.healthTips
          ) ?
            <section className="space-y-2 rounded-2xl border border-[#e5d5c5] bg-[#fdf8f2] px-5 py-5 text-sm">
              {plan.recommendations.waterIntake ?
                <p>
                  <span className="font-semibold text-ink">Water: </span>
                  {plan.recommendations.waterIntake}
                </p>
              : null}
              {plan.recommendations.foodsToAvoid ?
                <p>
                  <span className="font-semibold text-ink">Avoid: </span>
                  {plan.recommendations.foodsToAvoid}
                </p>
              : null}
              {plan.recommendations.supplements ?
                <p>
                  <span className="font-semibold text-ink">Supplements: </span>
                  {plan.recommendations.supplements}
                </p>
              : null}
              {plan.recommendations.healthTips ?
                <p>
                  <span className="font-semibold text-ink">Tips: </span>
                  {plan.recommendations.healthTips}
                </p>
              : null}
            </section>
          : null}

          <section aria-labelledby="meals-heading">
            <h2
              id="meals-heading"
              className="mb-4 font-display text-xl font-bold tracking-tight text-ink"
            >
              Meals
            </h2>
            <ul className="mc-roster divide-y divide-line">
              {plan.weeklyPlan.map((meal, i) => (
                <li key={`${meal.mealType}-${i}`} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display font-bold text-ink">
                      {meal.mealType}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {meal.mealTime}
                      {meal.calMin || meal.calMax ?
                        `, ${meal.calMin}-${meal.calMax} kcal`
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
          </section>

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
