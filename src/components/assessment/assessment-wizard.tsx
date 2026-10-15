"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type {
  PracticeBackLink,
  PracticeCrumb,
} from "@/components/practice/page-header";
import type { FoodMaster, MasterOption } from "@/lib/api/master";
import type {
  AssessmentFormState,
  AssessmentIds,
  GeneratedDietPlan,
} from "@/types/practice";

import { MealItemsEditor } from "@/components/assessment/meal-items-editor";
import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import {
  FOOD_ALLERGIES,
  FOOD_PREFERENCES,
  MEAL_SLOTS,
  MEDICAL_CONDITIONS,
  PHYSICAL_ACTIVITY_LEVELS,
  PREGNANCY_BF_OPTIONS,
  PRIMARY_GOALS,
  REGIONAL_CUISINES,
  SLEEP_DURATIONS,
  TARGET_TIMELINES,
  WORK_TYPES,
} from "@/data/lifestyle-options";
import {
  fetchFoodMaster,
  fetchParamList,
  resolveParamCode,
  resolveParamLabel,
} from "@/lib/api/master";
import {
  finishAssessment,
  generateDietPlan,
  saveBmi,
  saveClientDetail,
  saveDietPlan,
  saveLifestyle,
  saveMeals,
} from "@/lib/api/practice";
import { computeBmiMetrics } from "@/lib/assessment/bmi-metrics";
import { passesFoodType } from "@/lib/assessment/meal-items";
import { formatBmi } from "@/lib/bmi";
import { toApiDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  validateAge,
  validateEmail,
  validateHeight,
  validateRequired,
  validateWeight,
} from "@/lib/validation";
import { blankAssessmentForm } from "@/types/practice";

type WizardFlow = "add" | "checkup" | "dietPlan";

const PHASE_ICONS: Record<string, string> = {
  identity: "fas fa-user",
  lifestyle: "fas fa-heartbeat",
  meals: "fas fa-utensils",
  bmi: "fas fa-weight",
  diet: "fas fa-robot",
};

const PARAM_CODES = [
  "PC001",
  "PC002",
  "PC003",
  "PC004",
  "PC005",
  "PC006",
  "PC007",
  "PC008",
  "PC009",
  "PC010",
] as const;

/** Used only when the master list cannot be loaded. */
const PARAM_FALLBACKS: Record<string, readonly string[]> = {
  PC001: FOOD_PREFERENCES,
  PC002: REGIONAL_CUISINES,
  PC003: PHYSICAL_ACTIVITY_LEVELS,
  PC004: WORK_TYPES,
  PC005: SLEEP_DURATIONS,
  PC006: PREGNANCY_BF_OPTIONS,
  PC007: PRIMARY_GOALS,
  PC008: TARGET_TIMELINES,
  PC009: MEDICAL_CONDITIONS,
  PC010: FOOD_ALLERGIES,
};

type PhaseId = "identity" | "lifestyle" | "meals" | "bmi" | "diet" | "complete";

const ADD_PHASES: { id: PhaseId; label: string }[] = [
  { id: "identity", label: "Client Details" },
  { id: "lifestyle", label: "Lifestyle & Health" },
  { id: "meals", label: "Current Diet" },
  { id: "bmi", label: "BMI Detail" },
  { id: "diet", label: "AI Diet Plan" },
  { id: "complete", label: "Done" },
];

const CHECKUP_PHASES: { id: PhaseId; label: string }[] = [
  { id: "identity", label: "Client Details" },
  { id: "lifestyle", label: "Lifestyle & Health" },
  { id: "meals", label: "Current Diet" },
  { id: "bmi", label: "BMI Detail" },
  { id: "complete", label: "Done" },
];

const DIET_PHASES: { id: PhaseId; label: string }[] = [
  { id: "diet", label: "AI Diet Plan" },
  { id: "complete", label: "Done" },
];

type Props = {
  flow: WizardFlow;
  coachCode: string;
  savedBy: string;
  countryCd?: string;
  initialForm?: AssessmentFormState;
  initialIds?: AssessmentIds;
  title: string;
  description?: string;
  crumbs?: PracticeCrumb[];
  back?: PracticeBackLink;
  finishRedirect?: (ids: AssessmentIds) => string;
  onFinished?: (ids: AssessmentIds) => void;
  /** Skip the page title so a parent shell (client profile tabs) stays put. */
  embedded?: boolean;
};

function ChipMulti({
  label,
  options,
  values,
  onChange,
  required,
}: {
  required?: boolean;
  label: string;
  options: { code: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mc-field-label mb-2">
        {label}
        {required ?
          <span className="text-mc-primary" aria-hidden>
            {" "}
            *
          </span>
        : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const opt = option.code;
          const isNone = (code: string) =>
            (options.find((o) => o.code === code)?.label ?? code)
              .toLowerCase()
              .includes("none of the");
          const on = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={
                on ?
                  "rounded-full border-2 border-mc-secondary bg-mc-secondary px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border-2 border-mc-secondary bg-white px-3 py-1.5 text-xs font-semibold text-mc-secondary hover:bg-mc-secondary hover:text-white"
              }
              aria-pressed={on}
              onClick={() => {
                if (isNone(opt)) {
                  onChange(on ? [] : [opt]);
                  return;
                }
                const withoutNone = values.filter((v) => !isNone(v));
                onChange(
                  on ?
                    withoutNone.filter((v) => v !== opt)
                  : [...withoutNone, opt],
                );
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function DietPlanView({ plan }: { plan: GeneratedDietPlan }) {
  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-2xl bg-mc-secondary px-5 py-5 text-white">
          <p className="font-display text-sm font-semibold text-white/80">
            Daily target
          </p>
          <p className="mt-2 font-display text-4xl leading-none font-bold tabular-nums">
            {plan.summary.dailyCalTarget || "-"}
          </p>
          <p className="mt-2 text-sm text-white/75">kcal</p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-[#e5d5c5] bg-[#fdf8f2] px-4 py-3">
            <p className="text-sm text-ink-muted">BMI category</p>
            <p className="mt-1 font-display text-xl font-bold text-ink">
              {plan.summary.bmiCategory || "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e5d5c5] bg-[#fdf8f2] px-4 py-3">
            <p className="text-sm text-ink-muted">BMI</p>
            <p className="mt-1 font-display text-xl font-bold text-mc-secondary tabular-nums">
              {plan.summary.bmi ? formatBmi(plan.summary.bmi) : "-"}
            </p>
          </div>
        </div>
      </div>
      {(plan.recommendations.waterIntake ||
        plan.recommendations.foodsToAvoid ||
        plan.recommendations.supplements ||
        plan.recommendations.healthTips) && (
        <div className="space-y-2 text-sm">
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
        </div>
      )}
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-[#e5d5c5]">
        {plan.weeklyPlan.map((meal, i) => (
          <li key={`${meal.mealType}-${i}`} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">{meal.mealType}</p>
              <p className="text-xs text-ink-muted">
                {meal.mealTime}
                {meal.calMin || meal.calMax ?
                  `, ${meal.calMin}-${meal.calMax} kcal`
                : ""}
              </p>
            </div>
            {meal.options.length ?
              <ul className="mt-1 list-inside list-disc text-sm text-ink-muted">
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
    </div>
  );
}

export function AssessmentWizard({
  flow,
  coachCode,
  savedBy,
  countryCd = "IN",
  initialForm,
  initialIds = {},
  title,
  crumbs,
  back,
  finishRedirect,
  onFinished,
  embedded = false,
}: Props) {
  const router = useRouter();
  const phases = useMemo(() => {
    if (flow === "dietPlan") return DIET_PHASES;
    if (flow === "checkup") return CHECKUP_PHASES;
    return ADD_PHASES;
  }, [flow]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AssessmentFormState>(
    () => initialForm ?? blankAssessmentForm(),
  );
  const [ids, setIds] = useState<AssessmentIds>(initialIds);
  const [bmiSaved, setBmiSaved] = useState(false);
  const [hasUnsavedDietPlan, setHasUnsavedDietPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [paramLists, setParamLists] = useState<Record<string, MasterOption[]>>(
    {},
  );

  // The app saves PARAMLIST item codes. Load the same lists so web and app write identical values.
  useEffect(() => {
    let cancelled = false;
    void Promise.all(PARAM_CODES.map((code) => fetchParamList(code))).then(
      (lists) => {
        if (cancelled) return;
        const next = Object.fromEntries(
          PARAM_CODES.map((c, i) => [c, lists[i]!]),
        );
        setParamLists(next);
        const toCode = (value: string, pc: string) =>
          resolveParamCode(value, next[pc] ?? []);
        setForm((f) => ({
          ...f,
          foodPreference: toCode(f.foodPreference, "PC001"),
          regionalCuisine: toCode(f.regionalCuisine, "PC002"),
          physicalActivity: toCode(f.physicalActivity, "PC003"),
          workType: toCode(f.workType, "PC004"),
          sleepDuration: toCode(f.sleepDuration, "PC005"),
          pregnancy: toCode(f.pregnancy, "PC006"),
          primaryGoal: toCode(f.primaryGoal, "PC007"),
          targetTimeline: toCode(f.targetTimeline, "PC008"),
          medicalConditions: f.medicalConditions.map((v) => toCode(v, "PC009")),
          foodAllergies: f.foodAllergies.map((v) => toCode(v, "PC010")),
        }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const [foodMaster, setFoodMaster] = useState<FoodMaster>({});
  const [foodMasterReady, setFoodMasterReady] = useState(false);
  const cuisineLabel = resolveParamLabel(
    form.regionalCuisine,
    paramLists["PC002"] ?? [],
  );

  // Foods for the Current Diet step, same list the app uses.
  useEffect(() => {
    if (phases[step]?.id !== "meals") return;
    let cancelled = false;
    void fetchFoodMaster(
      countryCd || "IN",
      cuisineLabel || form.regionalCuisine,
    ).then((data) => {
      if (cancelled) return;
      setFoodMaster(data);
      setFoodMasterReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cuisineLabel, countryCd]);

  function optionsFor(pc: string): MasterOption[] {
    const live = paramLists[pc];
    if (live && live.length > 0) return live;
    return (PARAM_FALLBACKS[pc] ?? []).map((label) => ({ code: label, label }));
  }
  const labelOf = (value: string, pc: string) =>
    resolveParamLabel(value, optionsFor(pc)) || value;

  const phase = phases[step]!;
  const metrics = computeBmiMetrics({
    weight: form.weight,
    height: form.height,
    age: form.age,
    gender: form.gender,
  });

  function patch<K extends keyof AssessmentFormState>(
    key: K,
    value: AssessmentFormState[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /** Picking a date of birth fills in the age, like the app. Age can still be typed alone. */
  function onDobChange(value: string) {
    const born = value ? new Date(`${value}T00:00:00`) : null;
    let age = "";
    if (born && !Number.isNaN(born.getTime())) {
      const today = new Date();
      let years = today.getFullYear() - born.getFullYear();
      const birthdayPassed =
        today.getMonth() > born.getMonth() ||
        (today.getMonth() === born.getMonth() &&
          today.getDate() >= born.getDate());
      if (!birthdayPassed) years -= 1;
      if (years >= 0) age = String(years);
    }
    setForm((f) => ({ ...f, dob: value, ...(age ? { age } : {}) }));
  }

  function validateIdentity(): string | null {
    // Age is required. Date of birth is optional and fills the age in when given.
    const ageError = validateAge(form.age);
    return (
      validateRequired(form.clientName, "Full name") ??
      validateRequired(form.mobileNo, "Mobile number") ??
      validateEmail(form.emailId) ??
      validateRequired(form.location, "Location") ??
      ageError ??
      (form.gender ? null : "Gender is required.") ??
      validateHeight(form.height) ??
      validateWeight(form.weight)
    );
  }
  function validateLifestyle(): string | null {
    return (
      validateRequired(form.physicalActivity, "Physical activity") ??
      validateRequired(form.workType, "Work type") ??
      validateRequired(form.sleepDuration, "Sleep duration") ??
      validateRequired(form.foodPreference, "Food preference") ??
      validateRequired(form.regionalCuisine, "Regional cuisine") ??
      (form.medicalConditions.length ?
        null
      : "Please select at least one medical condition.") ??
      (form.foodAllergies.length ?
        null
      : "Please select at least one food allergy.")
    );
  }

  async function commitPhase(): Promise<boolean> {
    setError(null);
    const phaseId = phase.id;

    if (phaseId === "identity") {
      const v = validateIdentity();
      if (v) {
        setError(v);
        return false;
      }
      const next = await saveClientDetail({
        clientCode: ids.clientCode,
        assessmentCode: ids.assessmentCode,
        coachCode,
        clientName: form.clientName.trim(),
        mobileNo: form.mobileNo.trim(),
        emailId: form.emailId.trim(),
        location: form.location.trim(),
        dob: form.dob.trim(),
        gender: form.gender,
        age: parseInt(form.age, 10) || 0,
        weight: parseFloat(form.weight) || 0,
        height: Math.round(parseFloat(form.height)) || 0,
        savedBy,
      });
      if (!next.clientCode || !next.assessmentCode) {
        setError("Client was saved but assessment ids were not returned.");
        return false;
      }
      setIds(next);
      return true;
    }

    if (phaseId === "lifestyle") {
      const v = validateLifestyle();
      if (v) {
        setError(v);
        return false;
      }
      await saveLifestyle({
        clientCode: ids.clientCode,
        assessmentCode: ids.assessmentCode,
        coachCode,
        savedBy,
        foodPreference: form.foodPreference,
        regionalCuisine: form.regionalCuisine,
        physicalActivity: form.physicalActivity,
        workType: form.workType,
        sleepDuration: form.sleepDuration,
        pregnancy: form.pregnancy || "Not Applicable",
        medicalConditions: form.medicalConditions.join(", "),
        foodAllergies: form.foodAllergies.join(", "),
        primaryGoal: form.primaryGoal,
        targetTimeline: form.targetTimeline,
        additionalNotes: form.additionalNotes,
      });
      return true;
    }

    if (phaseId === "meals") {
      await saveMeals({
        ids,
        coachCode,
        savedBy,
        meals: form.meals,
      });
      return true;
    }

    if (phaseId === "bmi") {
      if (!metrics) {
        setError("Complete height, weight, age, and gender before saving BMI.");
        return false;
      }
      await saveBmi({
        assessmentCode: ids.assessmentCode,
        savedBy,
        metrics,
      });
      setBmiSaved(true);
      if (flow === "checkup") {
        await finishAssessment({
          ids,
          savedBy,
          metrics,
          bmiAlreadySaved: true,
        });
      }
      return true;
    }

    if (phaseId === "diet") {
      if (!form.dietPlan) {
        if (aiUnavailable || flow === "add") {
          await finishAssessment({
            ids,
            savedBy,
            metrics,
            bmiAlreadySaved: bmiSaved,
          });
          return true;
        }
        setError("Generate a plan before saving, or skip AI diet.");
        return false;
      }
      if (!hasUnsavedDietPlan && flow === "dietPlan") {
        setError("Generate or regenerate a plan before saving.");
        return false;
      }
      if (hasUnsavedDietPlan || flow === "add") {
        const result = await saveDietPlan({
          ids,
          coachCode,
          savedBy,
          plan: form.dietPlan,
        });
        setIds((prev) => ({
          clientCode: result.clientCode ?? prev.clientCode,
          assessmentCode: result.assessmentCode ?? prev.assessmentCode,
        }));
        setHasUnsavedDietPlan(false);
      }
      if (flow !== "dietPlan") {
        await finishAssessment({
          ids,
          savedBy,
          metrics,
          bmiAlreadySaved: bmiSaved,
        });
      }
      return true;
    }

    return true;
  }

  function openSavedClient(next: AssessmentIds = ids) {
    if (onFinished) {
      onFinished(next);
      return;
    }
    const dest =
      finishRedirect?.(next) ??
      (next.clientCode ?
        `/dashboard/clients/${encodeURIComponent(next.clientCode)}`
      : "/dashboard/clients");
    router.push(dest);
  }

  async function onNext() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (phase.id !== "complete") {
        const ok = await commitPhase();
        if (!ok) return;
      }
      const finishing =
        phase.id === "complete" || phases[step + 1]?.id === "complete";
      if (finishing) {
        openSavedClient(ids);
        return;
      }
      setStep(step + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function onGenerateDiet() {
    setGenerating(true);
    setError(null);
    setAiUnavailable(false);
    try {
      const plan = await generateDietPlan({
        clientName: form.clientName,
        gender: form.gender,
        age: parseInt(form.age, 10) || 0,
        weight: parseFloat(form.weight) || 0,
        height: parseInt(form.height, 10) || 0,
        country: countryCd,
        foodType: labelOf(form.foodPreference, "PC001"),
        cuisine: labelOf(form.regionalCuisine, "PC002"),
        activity: labelOf(form.physicalActivity, "PC003"),
        workType: labelOf(form.workType, "PC004"),
        sleep: labelOf(form.sleepDuration, "PC005"),
        pregnancy: labelOf(form.pregnancy, "PC006"),
        medical: form.medicalConditions
          .map((v) => labelOf(v, "PC009"))
          .join(", "),
        allergies: form.foodAllergies
          .map((v) => labelOf(v, "PC010"))
          .join(", "),
        goal: labelOf(form.primaryGoal, "PC007"),
        timeline: labelOf(form.targetTimeline, "PC008"),
        notes: form.additionalNotes,
        meals: form.meals,
      });
      patch("dietPlan", plan);
      setHasUnsavedDietPlan(true);
    } catch (err) {
      setAiUnavailable(true);
      setError(
        err instanceof Error ?
          `${err.message} You can finish without an AI plan.`
        : "AI diet plan is unavailable. You can finish without it.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const isLastContent =
    phase.id === "complete" ||
    (step === phases.length - 2 &&
      phases[phases.length - 1]?.id === "complete");

  return (
    <div className="min-w-0">
      {embedded ? null : (
        <div className="clt-page-head" style={{ marginBottom: 20 }}>
          <div>
            <h1 className="clt-page-title">{title}</h1>
            <nav className="clt-breadcrumb">
              <Link href={crumbs?.[0]?.href ?? "/dashboard"}>
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
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  required
                  value={form.clientName}
                  onChange={(e) => patch("clientName", e.target.value)}
                />
                <TextField
                  label="Mobile"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  value={form.mobileNo}
                  onChange={(e) =>
                    patch(
                      "mobileNo",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                />
                <TextField
                  label="Email (optional)"
                  type="email"
                  value={form.emailId}
                  onChange={(e) => patch("emailId", e.target.value)}
                />
                <TextField
                  label="Location"
                  required
                  value={form.location}
                  onChange={(e) => patch("location", e.target.value)}
                />
                <SelectField
                  label="Gender"
                  required
                  value={form.gender}
                  onChange={(e) => patch("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </SelectField>
                <TextField
                  label="Date of birth (optional)"
                  type="date"
                  value={toApiDate(form.dob) ?? ""}
                  max={new Date().toISOString().slice(0, 10)}
                  hint="Optional. Age fills in from Date of Birth."
                  onChange={(e) => onDobChange(e.target.value)}
                />
                <TextField
                  label="Age"
                  required
                  type="number"
                  value={form.age}
                  onChange={(e) => patch("age", e.target.value)}
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  required
                  value={form.weight}
                  onChange={(e) => patch("weight", e.target.value)}
                />
                <TextField
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  required
                  value={form.height}
                  onChange={(e) => patch("height", e.target.value)}
                />
              </div>
            </div>
          : null}

          {phase.id === "lifestyle" ?
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Food preference"
                  required
                  value={form.foodPreference}
                  onChange={(e) => patch("foodPreference", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC001").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Regional cuisine"
                  required
                  value={form.regionalCuisine}
                  onChange={(e) => patch("regionalCuisine", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC002").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Physical activity"
                  required
                  value={form.physicalActivity}
                  onChange={(e) => patch("physicalActivity", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC003").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Work type"
                  required
                  value={form.workType}
                  onChange={(e) => patch("workType", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC004").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Sleep duration"
                  required
                  value={form.sleepDuration}
                  onChange={(e) => patch("sleepDuration", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC005").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Pregnancy / breastfeeding (optional)"
                  value={form.pregnancy}
                  onChange={(e) => patch("pregnancy", e.target.value)}
                >
                  {optionsFor("PC006").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Primary goal (optional)"
                  value={form.primaryGoal}
                  onChange={(e) => patch("primaryGoal", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC007").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Target timeline (optional)"
                  value={form.targetTimeline}
                  onChange={(e) => patch("targetTimeline", e.target.value)}
                >
                  <option value="">Select</option>
                  {optionsFor("PC008").map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
              </div>
              <ChipMulti
                label="Medical conditions"
                required
                options={optionsFor("PC009")}
                values={form.medicalConditions}
                onChange={(v) => patch("medicalConditions", v)}
              />
              <ChipMulti
                label="Food allergies"
                required
                options={optionsFor("PC010")}
                values={form.foodAllergies}
                onChange={(v) => patch("foodAllergies", v)}
              />
              <TextAreaField
                label="Additional notes (optional)"
                value={form.additionalNotes}
                onChange={(e) => patch("additionalNotes", e.target.value)}
              />
            </div>
          : null}

          {phase.id === "meals" ?
            <div className="ac-stack space-y-4">
              <p className="text-sm text-ink-muted">
                Add what the client eats in each meal. Calories are approximate.
              </p>
              {MEAL_SLOTS.map((slot) => (
                <MealItemsEditor
                  key={`${slot.id}-${foodMasterReady}`}
                  label={slot.label}
                  text={form.meals[slot.id].text}
                  calories={form.meals[slot.id].calories}
                  foods={(foodMaster[slot.apiLabel] ?? []).filter((food) =>
                    passesFoodType(
                      food.cat,
                      labelOf(form.foodPreference, "PC001"),
                    ),
                  )}
                  onChange={(next) =>
                    patch("meals", {
                      ...form.meals,
                      [slot.id]: { text: next.text, calories: next.calories },
                    })
                  }
                />
              ))}
            </div>
          : null}

          {phase.id === "bmi" ?
            <div className="space-y-4">
              {!metrics ?
                <p className="text-sm text-ink-muted">
                  Height, weight, age, and gender are needed to compute BMI.
                </p>
              : <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {(
                    [
                      ["BMI", formatBmi(metrics.bmi)],
                      ["Category", metrics.bmiCategory],
                      ["Body fat", `${metrics.bodyFatPct}%`],
                      ["Visceral fat", String(metrics.visceralFat)],
                      ["Skeletal muscle", `${metrics.skeletalMusclePct}%`],
                      [
                        "Resting metabolism",
                        `${metrics.restingMetabolism} kcal`,
                      ],
                      ["Body age", `${metrics.bodyAge} yrs`],
                    ] as const
                  ).map(([label, value], index) => (
                    <div
                      key={label}
                      className={index === 0 ? "sm:col-span-2" : undefined}
                    >
                      <dt className="text-xs font-medium text-ink-muted">
                        {label}
                      </dt>
                      <dd
                        className={
                          index === 0 ?
                            "mt-1 font-display text-3xl font-bold text-ink tabular-nums"
                          : "mt-1 text-sm font-semibold text-ink"
                        }
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              }
            </div>
          : null}

          {phase.id === "diet" ?
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
                            err instanceof Error ?
                              err.message
                            : "Could not finish.",
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
                  Generate a plan from the client profile and current meals, or
                  finish without AI if the service is unavailable.
                </p>
              }
            </div>
          : null}

          {phase.id === "complete" ?
            <div className="flex flex-col items-start gap-3 py-4">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-[color:var(--mc-secondary-light)] text-mc-secondary">
                <i
                  className="fas fa-check"
                  style={{ fontSize: 24 }}
                  aria-hidden
                />
              </span>
              <p className="font-display text-xl font-bold text-ink">
                Assessment saved
              </p>
              <p className="text-sm text-ink-muted">
                You can open BMI and diet reports from the client profile.
              </p>
            </div>
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
