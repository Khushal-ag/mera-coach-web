"use client";

import Link from "next/link";

import type { WizardProps } from "./wizard/types";

import { AlertBanner } from "@/components/ui/alert-banner";
import { siteConfig } from "@/config/site";
import { PHASE_ICONS } from "@/constants/assessment";
import { cn } from "@/lib/utils";

import { PhaseBmi } from "./wizard/phase-bmi";
import { PhaseComplete } from "./wizard/phase-complete";
import { PhaseDiet } from "./wizard/phase-diet";
import { PhaseIdentity } from "./wizard/phase-identity";
import { PhaseLifestyle } from "./wizard/phase-lifestyle";
import { PhaseMeals } from "./wizard/phase-meals";
import { useAssessmentWizard } from "./wizard/use-assessment-wizard";

export function AssessmentWizard(props: WizardProps) {
  const wizard = useAssessmentWizard(props);
  const {
    flow,
    title,
    crumbs,
    back,
    embedded,
    step,
    setStep,
    saving,
    generating,
    error,
    setError,
    onNext,
    phases,
    phase,
    isLastContent,
  } = wizard;

  return (
    <div className="min-w-0">
      {embedded ? null : (
        <div className="clt-page-head" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="clt-page-title">{title}</h1>
            <nav className="clt-breadcrumb">
              <Link href={crumbs?.[0]?.href ?? siteConfig.links.dashboard}>
                <i className="fas fa-home" /> Home
              </Link>
              <i className="fas fa-chevron-right" />
              <Link
                href={back?.href ?? crumbs?.[1]?.href ?? "/dashboard/clients"}
              >
                Clients
              </Link>
              <i className="fas fa-chevron-right" />
              <span>{title}</span>
            </nav>
          </div>
        </div>
      )}
      <div className="stepper-wrap">
        <div className="stepper" aria-label="Wizard steps">
          {phases
            .filter((p) => p.id !== "complete")
            .flatMap((p, i, list) => {
              const active = phases[step]?.id === p.id;
              const done = i < step;
              const item = (
                <div
                  key={p.id}
                  className={cn(
                    "step-item",
                    active ? "active" : "",
                    done ? "done" : "",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <div className="step-circle">{i + 1}</div>
                  <div className="step-label">{p.label}</div>
                </div>
              );
              if (i === list.length - 1) return [item];
              return [
                item,
                <div
                  key={`${p.id}-line`}
                  className={cn("step-line", done ? "done" : "")}
                />,
              ];
            })}
        </div>
      </div>

      {error ?
        <div className="mb-4">
          <AlertBanner tone="error">{error}</AlertBanner>
        </div>
      : null}

      <div className="ac-card">
        {phase.id !== "complete" ?
          <h5
            className={cn(
              "ac-card-title",
              phase.id === "diet" ? "ac-card-title-diet" : "",
            )}
          >
            <i className={PHASE_ICONS[phase.id] ?? "fas fa-user"} />{" "}
            {phase.label}
          </h5>
        : null}
        <div className="ac-form p-5 sm:p-6">
          {phase.id === "identity" ?
            <PhaseIdentity wizard={wizard} />
          : null}

          {phase.id === "lifestyle" ?
            <PhaseLifestyle wizard={wizard} />
          : null}

          {phase.id === "meals" ?
            <PhaseMeals wizard={wizard} />
          : null}

          {phase.id === "bmi" ?
            <PhaseBmi wizard={wizard} />
          : null}

          {phase.id === "diet" ?
            <PhaseDiet wizard={wizard} />
          : null}

          {phase.id === "complete" ?
            <PhaseComplete />
          : null}

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:flex-wrap">
            {step > 0 && phase.id !== "complete" ?
              <button
                type="button"
                className="mc-btn-secondary w-full sm:w-auto"
                disabled={saving}
                onClick={() => {
                  setError(null);
                  setStep((s) => Math.max(0, s - 1));
                }}
              >
                Back
              </button>
            : null}
            <button
              type="button"
              className="ac-btn-next mc-btn-primary w-full sm:w-auto sm:min-w-[8rem]"
              disabled={saving || generating}
              onClick={() => void onNext()}
            >
              {saving ?
                "Saving"
              : phase.id === "complete" || isLastContent ?
                phase.id === "complete" ?
                  "Open client"
                : flow === "checkup" ?
                  "Save checkup"
                : flow === "dietPlan" ?
                  "Save plan"
                : "Save & finish"
              : "Save & Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
