/** Authenticated coach area shapes (client and coach endpoints). */

import type { MealSlotId } from "@/constants/lifestyle-options";

export type ClientSummary = {
  clientCode?: string;
  assessmentCode?: string;
  name: string;
  mobileNo?: string;
  age?: number;
  status?: string;
  lastCheckupDate?: string;
  height?: string;
  weight?: string;
  hasLifestyle?: boolean;
  hasDiet?: boolean;
};

type ClientMealSlot = {
  text: string;
  calories: number;
};

export type ClientMeals = Record<MealSlotId, ClientMealSlot>;

export type ClientDetail = {
  clientCode?: string;
  assessmentCode?: string;
  clientName?: string;
  mobileNo?: string;
  emailId?: string;
  location?: string;
  dob?: string;
  gender?: string;
  assessmentDate?: string;
  age?: number;
  weight?: number;
  height?: number;
  foodPreference?: string;
  regionalCuisine?: string;
  physicalActivity?: string;
  workType?: string;
  sleepDuration?: string;
  pregnancy?: string;
  medicalConditions?: string;
  foodAllergies?: string;
  primaryGoal?: string;
  targetTimeline?: string;
  additionalNotes?: string;
  meals?: ClientMeals;
};

export type AssessmentIds = {
  clientCode?: string;
  assessmentCode?: string;
};

export type RecheckupDueClient = {
  clientCode?: string;
  name: string;
  mobileNo?: string;
  age?: number;
  lastCheckupDate?: string;
  dueDate?: string;
  daysOverdue: number;
};

export type EnquiryLead = {
  id: number;
  dateLabel: string;
  clientName: string;
  clientMobile: string;
  clientEmail: string;
  lookingFor: string;
  isContacted: boolean;
  notes: string;
};

export type CoachPremiumOffer = {
  isPaid: boolean;
  planName?: string;
};

export type SaveClientDetailInput = {
  clientCode?: string;
  assessmentCode?: string;
  coachCode: string;
  clientName: string;
  mobileNo: string;
  emailId?: string;
  location?: string;
  dob?: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  savedBy: string;
};

export type SaveLifestyleInput = {
  clientCode?: string;
  assessmentCode?: string;
  coachCode: string;
  savedBy: string;
  foodPreference: string;
  regionalCuisine: string;
  physicalActivity: string;
  workType: string;
  sleepDuration: string;
  pregnancy: string;
  medicalConditions: string;
  foodAllergies: string;
  primaryGoal: string;
  targetTimeline: string;
  additionalNotes: string;
};

export type GeneratedDietPlanMeal = {
  mealType: string;
  mealTime: string;
  options: string[];
  calMin: number;
  calMax: number;
  tip?: string;
};

export type GeneratedDietPlan = {
  summary: {
    bmi: number;
    bmiCategory: string;
    dailyCalTarget: number;
  };
  recommendations: {
    waterIntake: string;
    foodsToAvoid: string;
    supplements: string;
    healthTips: string;
  };
  weeklyPlan: GeneratedDietPlanMeal[];
};

export type SaveDietPlanResult = {
  clientCode?: string;
  assessmentCode?: string;
  status?: string;
};

export type BmiMeasurement = {
  assessmentDate?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bodyFatPct?: number;
  visceralFat?: number;
  skeletalMusclePct?: number;
  restingMetabolism?: number;
  bodyAge?: number;
};

export type BmiReport = {
  client: {
    clientName?: string;
    age?: number;
    gender?: string;
    location?: string;
  };
  coach: {
    businessName?: string;
    coachName?: string;
    logoUrl?: string;
    address?: string;
    email?: string;
    mobile?: string;
  };
  current: BmiMeasurement;
  history?: BmiMeasurement[];
  bmiCategory?: string;
  targetWeight?: number;
  weightDelta?: number;
  reportDate?: string;
};

export type AssessmentFormState = {
  clientName: string;
  mobileNo: string;
  emailId: string;
  location: string;
  dob: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  foodPreference: string;
  regionalCuisine: string;
  physicalActivity: string;
  workType: string;
  sleepDuration: string;
  pregnancy: string;
  medicalConditions: string[];
  foodAllergies: string[];
  primaryGoal: string;
  targetTimeline: string;
  additionalNotes: string;
  meals: ClientMeals;
  dietPlan: GeneratedDietPlan | null;
};

export function emptyMeals(): ClientMeals {
  return {
    earlyMorning: { text: "", calories: 0 },
    breakfast: { text: "", calories: 0 },
    midMorningSnack: { text: "", calories: 0 },
    lunch: { text: "", calories: 0 },
    eveningSnack: { text: "", calories: 0 },
    dinner: { text: "", calories: 0 },
  };
}

export function blankAssessmentForm(): AssessmentFormState {
  return {
    clientName: "",
    mobileNo: "",
    emailId: "",
    location: "",
    dob: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    foodPreference: "",
    regionalCuisine: "",
    physicalActivity: "",
    workType: "",
    sleepDuration: "",
    pregnancy: "Not Applicable",
    medicalConditions: [],
    foodAllergies: [],
    primaryGoal: "",
    targetTimeline: "",
    additionalNotes: "",
    meals: emptyMeals(),
    dietPlan: null,
  };
}
