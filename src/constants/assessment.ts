import type { PhaseId } from "@/components/assessment/wizard/types";

import {
  FOOD_ALLERGIES,
  FOOD_PREFERENCES,
  MEDICAL_CONDITIONS,
  PHYSICAL_ACTIVITY_LEVELS,
  PREGNANCY_BF_OPTIONS,
  PRIMARY_GOALS,
  REGIONAL_CUISINES,
  SLEEP_DURATIONS,
  TARGET_TIMELINES,
  WORK_TYPES,
} from "@/constants/lifestyle-options";

export const PHASE_ICONS: Record<string, string> = {
  identity: "fas fa-user",
  lifestyle: "fas fa-heartbeat",
  meals: "fas fa-utensils",
  bmi: "fas fa-weight",
  diet: "fas fa-robot",
};

export const PARAM_CODES = [
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
export const PARAM_FALLBACKS: Record<string, readonly string[]> = {
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

export const ADD_PHASES: { id: PhaseId; label: string }[] = [
  { id: "identity", label: "Client Details" },
  { id: "lifestyle", label: "Lifestyle & Health" },
  { id: "meals", label: "Current Diet" },
  { id: "bmi", label: "BMI Detail" },
  { id: "diet", label: "AI Diet Plan" },
  { id: "complete", label: "Done" },
];

export const CHECKUP_PHASES: { id: PhaseId; label: string }[] = [
  { id: "identity", label: "Client Details" },
  { id: "lifestyle", label: "Lifestyle & Health" },
  { id: "meals", label: "Current Diet" },
  { id: "bmi", label: "BMI Detail" },
  { id: "complete", label: "Done" },
];

export const DIET_PHASES: { id: PhaseId; label: string }[] = [
  { id: "diet", label: "AI Diet Plan" },
  { id: "complete", label: "Done" },
];
