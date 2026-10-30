"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { WizardProps } from "./types";

import type { FoodMaster, MasterOption } from "@/lib/api/master";
import type { AssessmentFormState, AssessmentIds } from "@/types/practice";

import {
  ADD_PHASES,
  CHECKUP_PHASES,
  DIET_PHASES,
  PARAM_CODES,
  PARAM_FALLBACKS,
} from "@/constants/assessment";
import { useScrollTopOnChange } from "@/hooks/use-scroll-top-on-change";
import { uploadDocument } from "@/lib/api/document";
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
import { getSession } from "@/lib/auth/session";
import {
  fileToBase64DataUrl,
  validateRegisterImage,
} from "@/lib/media/image-file";
import {
  validateAge,
  validateEmail,
  validateHeight,
  validateRequired,
  validateWeight,
} from "@/lib/validation";
import { blankAssessmentForm } from "@/types/practice";

export function useAssessmentWizard({
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
}: WizardProps) {
  const router = useRouter();
  const phases = useMemo(() => {
    if (flow === "dietPlan") return DIET_PHASES;
    if (flow === "checkup") return CHECKUP_PHASES;
    return ADD_PHASES;
  }, [flow]);

  const [step, setStep] = useState(0);
  useScrollTopOnChange(step);
  const [form, setForm] = useState<AssessmentFormState>(
    () => initialForm ?? blankAssessmentForm(),
  );
  const [ids, setIds] = useState<AssessmentIds>(initialIds);
  // One photo for a new client, same as the app: it becomes the profile picture and the first progress photo.
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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
    // The PC002 code, same as the app sends.
    void fetchFoodMaster(countryCd || "IN", form.regionalCuisine).then(
      (data) => {
        if (cancelled) return;
        setFoodMaster(data);
        setFoodMasterReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, form.regionalCuisine, countryCd]);

  function optionsFor(pc: string): MasterOption[] {
    const live = paramLists[pc];
    const options =
      live && live.length > 0 ?
        live
      : (PARAM_FALLBACKS[pc] ?? []).map((label) => ({ code: label, label }));
    // The "none" option comes first in the medical and allergy lists, so it says "None of the below".
    const isNone = (o: MasterOption) =>
      o.label.toLowerCase().includes("none of the");
    const none = options.filter(isNone).map((o) => ({
      ...o,
      label: "None of the below",
    }));
    return none.length ?
        [...none, ...options.filter((o) => !isNone(o))]
      : options;
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

  function pickPhoto(file: File | null) {
    if (!file) {
      setPhotoFile(null);
      return;
    }
    const problem = validateRegisterImage(file);
    if (problem) {
      setError(problem.message);
      return;
    }
    setError(null);
    setPhotoFile(file);
  }
  function validateIdentity(): string | null {
    // Age is required. Date of birth is optional and fills the age in when given.
    const ageError = validateAge(form.age);
    return (
      (!ids.clientCode && !photoFile ? "Client photo is required." : null) ??
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
      if (photoFile) {
        // The client is already saved, so a failed upload is reported but does not undo it.
        try {
          const dataUrl = await fileToBase64DataUrl(photoFile);
          for (const docType of ["PROFILE_PIC", "PROGRESS_PHOTO"] as const) {
            await uploadDocument({
              base64DataUrl: dataUrl,
              coachCode,
              refCode: next.clientCode,
              refType: "CLIENT",
              docType,
              savedBy: getSession()?.coachId ?? 0,
            });
          }
          setPhotoFile(null);
        } catch (err) {
          setError(
            err instanceof Error ?
              `${err.message} You can add the photo from the client profile.`
            : "The client photo could not be uploaded. You can add it from the client profile.",
          );
        }
      }
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

  return {
    patch,
    flow,
    coachCode,
    savedBy,
    countryCd,
    initialForm,
    initialIds,
    title,
    crumbs,
    back,
    finishRedirect,
    onFinished,
    embedded,
    step,
    setStep,
    form,
    setForm,
    ids,
    setIds,
    photoFile,
    setPhotoFile,
    bmiSaved,
    setBmiSaved,
    hasUnsavedDietPlan,
    setHasUnsavedDietPlan,
    saving,
    setSaving,
    generating,
    setGenerating,
    error,
    setError,
    pickPhoto,
    aiUnavailable,
    setAiUnavailable,
    paramLists,
    setParamLists,
    foodMaster,
    setFoodMaster,
    foodMasterReady,
    setFoodMasterReady,
    optionsFor,
    onDobChange,
    validateIdentity,
    validateLifestyle,
    commitPhase,
    openSavedClient,
    onNext,
    onGenerateDiet,
    router,
    phases,
    cuisineLabel,
    labelOf,
    phase,
    metrics,
    isLastContent,
  };
}

export type WizardController = ReturnType<typeof useAssessmentWizard>;
