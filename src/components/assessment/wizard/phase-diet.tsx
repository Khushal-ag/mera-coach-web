"use client";

import type { WizardController } from "./use-assessment-wizard";

import { finishAssessment, saveDietPlan } from "@/lib/api/practice";

import { DietPlanView } from "./diet-plan-view";

export function PhaseDiet({ wizard }: { wizard: WizardController }) {
  const {
    flow,
    coachCode,
    savedBy,
    form,
    ids,
    bmiSaved,
    hasUnsavedDietPlan,
    saving,
    setSaving,
    generating,
    setError,
    aiUnavailable,
    openSavedClient,
    onGenerateDiet,
    metrics,
  } = wizard;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="mc-btn-primary"
          disabled={generating}
          onClick={() => void onGenerateDiet()}
        >
          {generating ?
            "Generating…"
          : form.dietPlan ?
            "Regenerate plan"
          : "Generate AI diet plan"}
        </button>
        {flow === "add" && (aiUnavailable || form.dietPlan) ?
          <button
            type="button"
            className="mc-btn-secondary"
            disabled={saving}
            onClick={() => {
              void (async () => {
                setSaving(true);
                try {
                  if (form.dietPlan && hasUnsavedDietPlan) {
                    await saveDietPlan({
                      ids,
                      coachCode,
                      savedBy,
                      plan: form.dietPlan,
                    });
                  }
                  await finishAssessment({
                    ids,
                    savedBy,
                    metrics,
                    bmiAlreadySaved: bmiSaved,
                  });
                  openSavedClient(ids);
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Could not finish.",
                  );
                } finally {
                  setSaving(false);
                }
              })();
            }}
          >
            Skip / finish without AI
          </button>
        : null}
      </div>
      {form.dietPlan ?
        <DietPlanView plan={form.dietPlan} />
      : <p className="text-sm text-ink-muted">
          Generate a plan from the client profile and current meals, or finish
          without AI if the service is unavailable.
        </p>
      }
    </div>
  );
}
