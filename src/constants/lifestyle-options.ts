/** Offline fallbacks matching mera-coach-app lifestyleOptions. */

/** Synthetic exclusive option for medical / allergy multi-selects (app wire code). */
export const NONE_OPTION = {
  code: "NONE_OF_THE_BELOW",
  label: "None of the below",
} as const;

/** Master wire codes that are not LI-style item codes — show a fixed label. */
export const PARAM_WIRE_CODE_LABELS: Record<string, string> = {
  NONE_OF_THE_BELOW: NONE_OPTION.label,
  NONE_OF_THE_ABOVE: "None of the above",
};

export const FOOD_PREFERENCES = [
  "Vegetarian",
  "Vegan",
  "Eggetarian",
  "Non-Vegetarian",
] as const;

export const REGIONAL_CUISINES = [
  "North Indian",
  "South Indian",
  "East Indian",
  "West Indian",
  "Continental",
  "Mixed",
] as const;

export const PHYSICAL_ACTIVITY_LEVELS = [
  "Sedentary (little or no exercise)",
  "Lightly Active (1-3 days/week)",
  "Moderately Active (3-5 days/week)",
  "Very Active (6-7 days/week)",
  "Extra Active (physical job)",
] as const;

export const WORK_TYPES = [
  "Desk Job (Sitting)",
  "Field Job (Standing/Moving)",
  "Physical Labour",
  "Work from Home",
  "Homemaker",
  "Student",
] as const;

export const SLEEP_DURATIONS = [
  "Less than 5 hrs",
  "5-6 hrs",
  "6-7 hrs",
  "7-8 hrs",
  "More than 8 hrs",
] as const;

export const PREGNANCY_BF_OPTIONS = [
  "Not Applicable",
  "Pregnant",
  "Breastfeeding",
  "Planning Pregnancy",
] as const;

export const MEDICAL_CONDITIONS = [
  "None of the below",
  "Diabetes (Type 2)",
  "Diabetes (Type 1)",
  "High Blood Pressure",
  "Low Blood Pressure",
  "Thyroid (Hypothyroid)",
  "Thyroid (Hyperthyroid)",
  "PCOD / PCOS",
  "High Cholesterol",
  "Kidney Issues",
  "Heart Disease",
  "Arthritis / Joint Pain",
] as const;

export const FOOD_ALLERGIES = [
  "None of the below",
  "Dairy / Lactose",
  "Gluten / Wheat",
  "Nuts",
  "Eggs",
  "Soy",
  "Seafood",
] as const;

export const PRIMARY_GOALS = [
  "Weight Loss",
  "Weight Gain",
  "Muscle Building",
  "Maintain Weight",
  "Improve Stamina",
  "Manage Medical Condition",
  "General Wellness",
] as const;

export const TARGET_TIMELINES = [
  "1 Month",
  "2 Months",
  "3 Months",
  "6 Months",
  "1 Year",
  "Ongoing",
] as const;

export const MEAL_SLOTS = [
  {
    id: "earlyMorning",
    label: "Early Morning",
    apiLabel: "Early Morning",
    order: 1,
  },
  { id: "breakfast", label: "Breakfast", apiLabel: "Breakfast", order: 2 },
  {
    id: "midMorningSnack",
    label: "Mid-Morning Snack",
    apiLabel: "Mid Morning",
    order: 3,
  },
  { id: "lunch", label: "Lunch", apiLabel: "Lunch", order: 4 },
  { id: "eveningSnack", label: "Evening Snack", apiLabel: "Evening", order: 5 },
  { id: "dinner", label: "Dinner", apiLabel: "Dinner", order: 6 },
] as const;

export type MealSlotId = (typeof MEAL_SLOTS)[number]["id"];
