import type { AssessmentFormState, ClientDetail } from "@/types/practice";

import { blankAssessmentForm, emptyMeals } from "@/types/practice";

function splitCsv(value?: string): string[] {
  return value ?
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

/** Map API gender labels to M/F codes used by save-bmi / generate-diet-plan. */
function normalizeGenderCode(gender?: string): string {
  const g = (gender ?? "").trim().toLowerCase();
  if (g === "m" || g === "male") return "M";
  if (g === "f" || g === "female") return "F";
  return (gender ?? "").trim();
}

export function detailToForm(detail: ClientDetail): AssessmentFormState {
  const base = blankAssessmentForm();
  return {
    ...base,
    clientName: detail.clientName ?? "",
    mobileNo: detail.mobileNo ?? "",
    emailId: detail.emailId ?? "",
    location: detail.location ?? "",
    dob: (detail.dob ?? "").slice(0, 10),
    gender: normalizeGenderCode(detail.gender),
    age: detail.age != null ? String(detail.age) : "",
    weight: detail.weight != null ? String(detail.weight) : "",
    height: detail.height != null ? String(detail.height) : "",
    foodPreference: detail.foodPreference ?? "",
    regionalCuisine: detail.regionalCuisine ?? "",
    physicalActivity: detail.physicalActivity ?? "",
    workType: detail.workType ?? "",
    sleepDuration: detail.sleepDuration ?? "",
    pregnancy: detail.pregnancy || "Not Applicable",
    medicalConditions: splitCsv(detail.medicalConditions),
    foodAllergies: splitCsv(detail.foodAllergies),
    primaryGoal: detail.primaryGoal ?? "",
    targetTimeline: detail.targetTimeline ?? "",
    additionalNotes: detail.additionalNotes ?? "",
    meals: detail.meals ?? emptyMeals(),
    dietPlan: null,
  };
}
