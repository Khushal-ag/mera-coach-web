import type { BodyMetrics } from "@/lib/assessment/bmi-metrics";
import type { CoachEvent, CoachPackage, CoachProfile } from "@/types/coach";
import type {
  AssessmentIds,
  BmiMeasurement,
  BmiReport,
  ClientDetail,
  ClientMeals,
  ClientSummary,
  CoachPremiumOffer,
  EnquiryLead,
  GeneratedDietPlan,
  RecheckupDueClient,
  SaveClientDetailInput,
  SaveDietPlanResult,
  SaveLifestyleInput,
} from "@/types/practice";

import { MEAL_SLOTS } from "@/data/lifestyle-options";
import { authedFetch } from "@/lib/api/authed";
import { apiFetch } from "@/lib/api/client";
import { firstApiError, isApiSuccess, pick } from "@/lib/api/normalize";
import { ApiRequestError } from "@/lib/api/types";
import {
  hasDietPlanContent,
  normalizeGeneratedDietPlan,
} from "@/lib/assessment/normalize-diet-plan";
import { parseCoachEvents, pickEventsRaw } from "@/lib/coach/events";
import { parseCoachPackages, pickPackagesRaw } from "@/lib/coach/packages";
import { formatLocalDate, toApiDate } from "@/lib/dates";
import { emptyMeals } from "@/types/practice";

function mapClientListItem(raw: Record<string, unknown>): ClientSummary {
  return {
    clientCode:
      String(pick(raw, "clientCode", "ClientCode") ?? "").trim() || undefined,
    assessmentCode:
      String(pick(raw, "assessmentCode", "AssessmentCode") ?? "").trim() ||
      undefined,
    name: String(pick(raw, "clientName", "ClientName") ?? "").trim(),
    mobileNo:
      String(pick(raw, "mobileNo", "MobileNo") ?? "").trim() || undefined,
    age: Number(pick(raw, "age", "Age") ?? NaN) || undefined,
    status:
      String(pick(raw, "status_Cd", "Status_Cd") ?? "").trim() || undefined,
    lastCheckupDate:
      String(pick(raw, "lastCheckupDate", "LastCheckupDate") ?? "").trim() ||
      undefined,
    height: String(pick(raw, "height", "Height") ?? "").trim() || undefined,
    weight: String(pick(raw, "weight", "Weight") ?? "").trim() || undefined,
    hasLifestyle: flagOn(pick(raw, "hasLifestyle", "HasLifestyle")),
    hasDiet: flagOn(pick(raw, "hasDiet", "HasDiet")),
  };
}

function flagOn(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

export async function fetchClientList(params: {
  coachCode: string;
  searchText?: string;
  searchOption?: string;
}): Promise<ClientSummary[]> {
  const items = await authedFetch<unknown[]>("v1/Client/ClientList", {
    method: "POST",
    body: {
      coachCode: params.coachCode,
      searchOption: params.searchOption ?? "",
      searchText: params.searchText ?? "",
    },
  });
  return (items ?? []).map((row) =>
    mapClientListItem((row ?? {}) as Record<string, unknown>),
  );
}

export async function fetchRecheckupList(params: {
  coachCode: string;
  searchOption?: string;
  searchText?: string;
}): Promise<RecheckupDueClient[]> {
  const items = await authedFetch<unknown[]>("v1/Client/recheckup-list", {
    method: "POST",
    body: {
      coachCode: params.coachCode,
      searchOption: params.searchOption ?? "",
      searchText: params.searchText ?? "",
    },
  });
  return (items ?? []).map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    const days = Number(pick(r, "daysOverdue", "DaysOverdue") ?? 0);
    return {
      clientCode:
        String(pick(r, "clientCode", "ClientCode") ?? "").trim() || undefined,
      name: String(pick(r, "clientName", "ClientName") ?? "").trim(),
      mobileNo:
        String(pick(r, "mobileNo", "MobileNo") ?? "").trim() || undefined,
      age: Number(pick(r, "age", "Age") ?? NaN) || undefined,
      lastCheckupDate:
        String(pick(r, "lastCheckupDate", "LastCheckupDate") ?? "").trim() ||
        undefined,
      dueDate: String(pick(r, "dueDate", "DueDate") ?? "").trim() || undefined,
      daysOverdue: Number.isFinite(days) ? Math.floor(days) : 0,
    };
  });
}

function mapApiMealLabelToSlot(label: string): keyof ClientMeals | null {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (key === "earlymorning") return "earlyMorning";
  if (key === "breakfast") return "breakfast";
  if (key === "midmorning" || key === "midmorningsnack")
    return "midMorningSnack";
  if (key === "lunch") return "lunch";
  if (key === "evening" || key === "eveningsnack") return "eveningSnack";
  if (key === "dinner") return "dinner";
  return null;
}

function parseMealsFromDetail(raw: Record<string, unknown>): ClientMeals {
  const meals = emptyMeals();
  const list = pick<unknown[]>(raw, "meals", "Meals");
  if (!Array.isArray(list)) return meals;
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const slot = mapApiMealLabelToSlot(
      String(pick(r, "mealSlot", "MealSlot") ?? ""),
    );
    if (!slot) continue;
    meals[slot] = {
      text: String(pick(r, "curFoodItems", "CurFoodItems") ?? "").trim(),
      calories: Number(pick(r, "curCalories", "CurCalories") ?? 0) || 0,
    };
  }
  return meals;
}

export async function fetchClientDetail(params: {
  clientCode?: string;
  assessmentCode?: string;
}): Promise<ClientDetail> {
  const raw = await authedFetch<Record<string, unknown> | null>(
    "v1/Client/ClientDetail",
    {
      method: "POST",
      body: params,
    },
  );
  if (!raw) throw new Error("Client not found.");
  return {
    clientCode:
      String(pick(raw, "clientCode", "ClientCode") ?? "") || undefined,
    assessmentCode:
      String(pick(raw, "assessmentCode", "AssessmentCode") ?? "") || undefined,
    clientName:
      String(pick(raw, "clientName", "ClientName") ?? "") || undefined,
    mobileNo: String(pick(raw, "mobileNo", "MobileNo") ?? "") || undefined,
    emailId: String(pick(raw, "emailId", "EmailId") ?? "") || undefined,
    location: String(pick(raw, "location", "Location") ?? "") || undefined,
    dob: String(pick(raw, "dob", "Dob") ?? "") || undefined,
    gender: String(pick(raw, "gender", "Gender") ?? "") || undefined,
    assessmentDate:
      String(pick(raw, "assessmentDate", "AssessmentDate") ?? "") || undefined,
    age: Number(pick(raw, "age", "Age") ?? NaN) || undefined,
    weight: Number(pick(raw, "weight", "Weight") ?? NaN) || undefined,
    height: Number(pick(raw, "height", "Height") ?? NaN) || undefined,
    foodPreference:
      String(pick(raw, "foodPreference", "FoodPreference") ?? "") || undefined,
    regionalCuisine:
      String(pick(raw, "regionalCuisine", "RegionalCuisine") ?? "") ||
      undefined,
    physicalActivity:
      String(pick(raw, "physicalActivity", "PhysicalActivity") ?? "") ||
      undefined,
    workType: String(pick(raw, "workType", "WorkType") ?? "") || undefined,
    sleepDuration:
      String(pick(raw, "sleepDuration", "SleepDuration") ?? "") || undefined,
    pregnancy: String(pick(raw, "pregnancy", "Pregnancy") ?? "") || undefined,
    medicalConditions:
      String(pick(raw, "medicalConditions", "MedicalConditions") ?? "") ||
      undefined,
    foodAllergies:
      String(pick(raw, "foodAllergies", "FoodAllergies") ?? "") || undefined,
    primaryGoal:
      String(pick(raw, "primaryGoal", "PrimaryGoal") ?? "") || undefined,
    targetTimeline:
      String(pick(raw, "targetTimeline", "TargetTimeline") ?? "") || undefined,
    additionalNotes:
      String(pick(raw, "additionalNotes", "AdditionalNotes") ?? "") ||
      undefined,
    meals: parseMealsFromDetail(raw),
  };
}

/** Same-day assessment resumes; otherwise start a fresh checkup. */
export function resolveCheckupAssessmentIds(
  detail: ClientDetail,
): AssessmentIds {
  const today = formatLocalDate();
  const isToday = (detail.assessmentDate ?? "").trim() === today;
  return {
    clientCode: detail.clientCode,
    assessmentCode: isToday ? detail.assessmentCode : undefined,
  };
}

export async function saveClientDetail(
  input: SaveClientDetailInput,
): Promise<{ clientCode: string; assessmentCode: string }> {
  const raw = await authedFetch<Record<string, unknown>>(
    "v1/Client/save-client-detail",
    {
      method: "POST",
      body: {
        clientCode: input.clientCode ?? "",
        assessmentCode: input.assessmentCode ?? "",
        coachCode: input.coachCode,
        clientName: input.clientName,
        mobileNo: input.mobileNo,
        emailId: input.emailId ?? "",
        alternateMobileNo: "",
        location: input.location ?? "",
        dob: toApiDate(input.dob),
        gender: input.gender ?? "",
        assessmentDate: formatLocalDate(),
        age: input.age ?? 0,
        weight: input.weight ?? 0,
        height: input.height ?? 0,
        savedBy: input.savedBy,
      },
    },
  );
  return {
    clientCode: String(pick(raw, "clientCode", "ClientCode") ?? ""),
    assessmentCode: String(pick(raw, "assessmentCode", "AssessmentCode") ?? ""),
  };
}

export async function fetchEnquiryLeads(
  coachCode: string,
): Promise<EnquiryLead[]> {
  const items = await authedFetch<unknown[]>("v1/Client/coach-enquiry-lead", {
    method: "GET",
    searchParams: { mode: "list", coachCode },
  });
  return (items ?? [])
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      const id = Number(
        pick(r, "coachEnquiryLeadId", "CoachEnquiryLeadId") ?? NaN,
      );
      if (!Number.isFinite(id)) return null;
      return {
        id,
        dateLabel: String(pick(r, "fcdt", "Fcdt") ?? "").trim(),
        clientName: String(pick(r, "clientName", "ClientName") ?? "").trim(),
        clientMobile: String(
          pick(r, "clientMobile", "ClientMobile") ?? "",
        ).trim(),
        clientEmail: String(pick(r, "clientEmail", "ClientEmail") ?? "").trim(),
        lookingFor: String(pick(r, "lookingFor", "LookingFor") ?? "").trim(),
        isContacted: Boolean(pick(r, "isContacted", "IsContacted")),
        notes: String(pick(r, "notes", "Notes") ?? "").trim(),
      } satisfies EnquiryLead;
    })
    .filter((l): l is EnquiryLead => l != null);
}

export async function updateEnquiryLead(params: {
  leadId: number;
  isContacted?: boolean;
  notes?: string;
}): Promise<void> {
  await authedFetch("v1/Client/coach-enquiry-lead", {
    method: "POST",
    body: {
      mode: "update",
      leadId: params.leadId,
      ...(params.isContacted !== undefined ?
        { isContacted: params.isContacted }
      : {}),
      ...(params.notes !== undefined ? { notes: params.notes } : {}),
    },
  });
}

/** Same truthiness as the app premium flag: boolean, 1, or "true"/"1". */
function readPaidFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    return s === "1" || s === "true";
  }
  return false;
}

/**
 * Same paid semantics as app `mapPremiumOffer`: when a subscription object is
 * present, `status === "active"` wins over a bare isPaid flag.
 */
export async function fetchCoachPremiumOffer(): Promise<CoachPremiumOffer> {
  const raw = await authedFetch<Record<string, unknown> | null>(
    "v1/Coach/premium",
  );
  if (!raw || typeof raw !== "object") {
    throw new Error("Could not check subscription. Try again.");
  }
  const paidFlag = readPaidFlag(
    pick(raw, "isPaid", "IsPaid", "is_paid", "isPremium", "IsPremium") ??
      pick(raw, "paid", "Paid"),
  );
  const subscriptionRaw = pick<Record<string, unknown>>(
    raw,
    "subscription",
    "Subscription",
  );
  let isPaid = paidFlag;
  let planName: string | undefined;
  if (subscriptionRaw && typeof subscriptionRaw === "object") {
    const status = String(pick(subscriptionRaw, "status", "Status") ?? "")
      .trim()
      .toLowerCase();
    isPaid = status === "active";
    planName =
      String(pick(subscriptionRaw, "planName", "PlanName") ?? "").trim() ||
      undefined;
  }
  if (!planName) {
    const nestedPlan = pick<Record<string, unknown>>(raw, "plan", "Plan");
    planName =
      String(
        pick(
          raw,
          "planName",
          "PlanName",
          "subscriptionName",
          "SubscriptionName",
        ) ??
          (nestedPlan ? pick(nestedPlan, "planName", "PlanName") : "") ??
          "",
      ).trim() || undefined;
  }
  return { isPaid, planName };
}

export async function fetchAuthedCoachProfile(): Promise<CoachProfile | null> {
  const raw = await authedFetch<Record<string, unknown>>("v1/Coach/profile");
  if (!raw) return null;
  const packages = parseCoachPackages(pickPackagesRaw(raw));
  const events = parseCoachEvents(pickEventsRaw(raw));
  return {
    coachId: Number(pick(raw, "coachId", "CoachId") ?? 0),
    coachCode: String(pick(raw, "coachCode", "CoachCode") ?? ""),
    coachName: String(pick(raw, "coachName", "CoachName") ?? ""),
    businessName:
      String(pick(raw, "businessName", "BusinessName") ?? "") || null,
    coachTypeCode:
      String(pick(raw, "coachTypeCode", "CoachTypeCode") ?? "") || null,
    coachTypeName:
      String(pick(raw, "coachTypeName", "CoachTypeName") ?? "") || null,
    city_Cd: String(pick(raw, "city_Cd", "City_Cd") ?? "") || null,
    state_Cd: String(pick(raw, "state_Cd", "State_Cd") ?? "") || null,
    country_Cd: String(pick(raw, "country_Cd", "Country_Cd") ?? "") || null,
    locality: String(pick(raw, "locality", "Locality") ?? "") || null,
    add_Line: String(pick(raw, "add_Line", "Add_Line") ?? "") || null,
    tagline: String(pick(raw, "tagline", "Tagline") ?? "") || null,
    coachDesc: String(pick(raw, "coachDesc", "CoachDesc") ?? "") || null,
    profile_Pic_Url:
      String(pick(raw, "profile_Pic_Url", "Profile_Pic_Url") ?? "") || null,
    logo_Url: String(pick(raw, "logo_Url", "Logo_Url") ?? "") || null,
    cover_Url: String(pick(raw, "cover_Url", "Cover_Url") ?? "") || null,
    serviceNames:
      String(pick(raw, "serviceNames", "ServiceNames") ?? "") || null,
    experienceYears: Number(
      pick(raw, "experienceYears", "ExperienceYears") ?? 0,
    ),
    happyClientCount: Number(
      pick(raw, "happyClientCount", "HappyClientCount") ?? 0,
    ),
    certificationCount: Number(
      pick(raw, "certificationCount", "CertificationCount") ?? 0,
    ),
    localLanguage:
      String(pick(raw, "localLanguage", "LocalLanguage") ?? "") || null,
    email: String(pick(raw, "email", "Email") ?? "") || null,
    mobile: String(pick(raw, "mobile", "Mobile") ?? "") || null,
    pinCode: String(pick(raw, "pinCode", "PinCode") ?? "") || null,
    serviceCodes:
      Array.isArray(pick(raw, "serviceCodes", "ServiceCodes")) ?
        (pick(raw, "serviceCodes", "ServiceCodes") as unknown[]).map(String)
      : String(pick(raw, "serviceNames", "ServiceNames") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    bmiReportTemplate:
      String(pick(raw, "bmiReportTemplate", "BmiReportTemplate") ?? "") || null,
    dietChartTemplate:
      String(pick(raw, "dietChartTemplate", "DietChartTemplate") ?? "") || null,
    isProfileVisible: (() => {
      const v = pick(
        raw,
        "isProfileVisible",
        "IsProfileVisible",
        "Is_profileVisible",
      );
      if (v === undefined || v === null || v === "") return undefined;
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      return String(v).toLowerCase() === "true" || String(v) === "1";
    })(),
    missingPublicFields:
      Array.isArray(pick(raw, "missingPublicFields", "MissingPublicFields")) ?
        (
          pick(raw, "missingPublicFields", "MissingPublicFields") as unknown[]
        ).map(String)
      : undefined,
    packages,
    events,
  };
}

export async function saveCoachPackagesEvents(params: {
  profile: CoachProfile;
  packages?: CoachPackage[];
  events?: CoachEvent[];
}): Promise<void> {
  const { profile, packages, events } = params;
  const body: Record<string, unknown> = {
    coachId: profile.coachId,
    coachName: profile.coachName,
    coachTypeCode: profile.coachTypeCode ?? "",
    mobile: profile.mobile ?? "",
    email: profile.email ?? "",
    businessName: profile.businessName ?? "",
    experienceYears: profile.experienceYears ?? 0,
    happyClientCount: profile.happyClientCount ?? 0,
    certificationCount: profile.certificationCount ?? 0,
    tagline: profile.tagline ?? "",
    localLanguage: profile.localLanguage ?? "",
    locality: profile.locality ?? "",
    add_Line: profile.add_Line ?? "",
    city_Cd: profile.city_Cd ?? "",
    state_Cd: profile.state_Cd ?? "",
    country_Cd: profile.country_Cd ?? "",
    logo_Url: profile.logo_Url ?? "",
    profile_Pic_Url: profile.profile_Pic_Url ?? "",
    cover_Url: profile.cover_Url ?? "",
    coachDesc: profile.coachDesc ?? "",
    serviceCodes: [],
  };
  if (packages !== undefined) {
    body.packages = packages;
    body.packagesJson = JSON.stringify(packages);
  }
  if (events !== undefined) {
    body.events = events;
    body.eventsJson = JSON.stringify(events);
  }
  await authedFetch("v1/Coach/save", { method: "POST", body });
}

export async function saveCoachProfileEssentials(params: {
  profile: CoachProfile;
  coachName: string;
  tagline: string;
  coachDesc: string;
  locality: string;
  city_Cd: string;
  mobile: string;
  email: string;
  businessName?: string;
  add_Line?: string;
  state_Cd?: string;
  country_Cd?: string;
  pinCode?: string;
  localLanguage?: string;
  experienceYears?: number;
  happyClientCount?: number;
  certificationCount?: number;
  coachTypeCode?: string;
  serviceCodes?: string[];
  logo_Url?: string | null;
  profile_Pic_Url?: string | null;
  cover_Url?: string | null;
  bmiReportTemplate?: string;
  dietChartTemplate?: string;
}): Promise<void> {
  const { profile } = params;
  await authedFetch("v1/Coach/save", {
    method: "POST",
    body: {
      coachId: profile.coachId,
      coachName: params.coachName,
      coachTypeCode: params.coachTypeCode ?? profile.coachTypeCode ?? "",
      mobile: params.mobile,
      email: params.email,
      businessName: params.businessName ?? profile.businessName ?? "",
      experienceYears: params.experienceYears ?? profile.experienceYears ?? 0,
      happyClientCount:
        params.happyClientCount ?? profile.happyClientCount ?? 0,
      certificationCount:
        params.certificationCount ?? profile.certificationCount ?? 0,
      tagline: params.tagline,
      localLanguage: params.localLanguage ?? profile.localLanguage ?? "",
      locality: params.locality,
      add_Line: params.add_Line ?? profile.add_Line ?? "",
      city_Cd: params.city_Cd,
      state_Cd: params.state_Cd ?? profile.state_Cd ?? "",
      pinCode: params.pinCode ?? profile.pinCode ?? "",
      country_Cd: params.country_Cd ?? profile.country_Cd ?? "",
      logo_Url: params.logo_Url ?? profile.logo_Url ?? "",
      profile_Pic_Url: params.profile_Pic_Url ?? profile.profile_Pic_Url ?? "",
      cover_Url: params.cover_Url ?? profile.cover_Url ?? "",
      coachDesc: params.coachDesc,
      bmiReportTemplate:
        params.bmiReportTemplate ?? profile.bmiReportTemplate ?? "",
      dietChartTemplate:
        params.dietChartTemplate ?? profile.dietChartTemplate ?? "",
      serviceCodes: params.serviceCodes ?? profile.serviceCodes ?? [],
      packages: profile.packages ?? [],
      packagesJson: JSON.stringify(profile.packages ?? []),
      events: profile.events ?? [],
      eventsJson: JSON.stringify(profile.events ?? []),
    },
  });
}

export async function saveLifestyle(input: SaveLifestyleInput): Promise<void> {
  await authedFetch("v1/Client/save-lifestyle", {
    method: "POST",
    body: {
      assessmentCode: input.assessmentCode,
      coachCode: input.coachCode,
      clientCode: input.clientCode,
      savedBy: input.savedBy,
      foodPreference: input.foodPreference,
      regionalCuisine: input.regionalCuisine,
      physicalActivity: input.physicalActivity,
      workType: input.workType,
      sleepDuration: input.sleepDuration,
      pregnancy: input.pregnancy,
      medicalConditions: input.medicalConditions,
      foodAllergies: input.foodAllergies,
      primaryGoal: input.primaryGoal,
      targetTimeline: input.targetTimeline,
      additionalNotes: input.additionalNotes,
    },
  });
}

export async function saveMeals(params: {
  ids: AssessmentIds;
  coachCode: string;
  savedBy: string;
  meals: ClientMeals;
}): Promise<void> {
  await authedFetch("v1/Client/save-meals", {
    method: "POST",
    body: {
      assessmentCode: params.ids.assessmentCode,
      coachCode: params.coachCode,
      clientCode: params.ids.clientCode,
      savedBy: params.savedBy,
      meals: MEAL_SLOTS.map((slot) => ({
        mealSlot: slot.apiLabel,
        mealOrder: slot.order,
        curFoodItems: params.meals[slot.id]?.text ?? "",
        curCalories: params.meals[slot.id]?.calories ?? 0,
      })),
    },
  });
}

export async function saveBmi(params: {
  assessmentCode?: string;
  savedBy: string;
  metrics: BodyMetrics;
  totalDailyIntakeCal?: number;
}): Promise<void> {
  await authedFetch("v1/Client/save-bmi", {
    method: "POST",
    body: {
      assessmentCode: params.assessmentCode,
      bmi: params.metrics.bmi,
      bmiCategory: params.metrics.bmiCategory,
      bodyFatPct: params.metrics.bodyFatPct,
      visceralFat: params.metrics.visceralFat,
      skeletalMusclePct: params.metrics.skeletalMusclePct,
      restingMetabolism: params.metrics.restingMetabolism,
      bodyAge: params.metrics.bodyAge,
      totalDailyIntakeCal: params.totalDailyIntakeCal ?? 0,
      savedBy: params.savedBy,
    },
  });
}

const PLAN_MEAL_TYPE_TO_DB_LABEL: Record<string, string> = {
  "Mid-Morning Snack": "Mid Morning",
  "Evening Snack": "Evening",
};

export async function saveDietPlan(params: {
  ids: AssessmentIds;
  coachCode: string;
  savedBy: string;
  plan: GeneratedDietPlan;
}): Promise<SaveDietPlanResult> {
  const data = await authedFetch<Record<string, unknown> | null>(
    "v1/Client/save-diet-plan",
    {
      method: "POST",
      body: {
        assessmentCode: params.ids.assessmentCode,
        coachCode: params.coachCode,
        clientCode: params.ids.clientCode,
        savedBy: params.savedBy,
        dailyCalTarget: params.plan.summary?.dailyCalTarget ?? 0,
        bmiCategory: params.plan.summary?.bmiCategory ?? "",
        waterIntake: params.plan.recommendations?.waterIntake ?? "",
        foodsToAvoid: params.plan.recommendations?.foodsToAvoid ?? "",
        supplements: params.plan.recommendations?.supplements ?? "",
        healthTips: params.plan.recommendations?.healthTips ?? "",
        meals: (params.plan.weeklyPlan || []).map((m) => ({
          mealSlot: PLAN_MEAL_TYPE_TO_DB_LABEL[m.mealType] ?? m.mealType,
          plnMealTime: m.mealTime ?? "",
          plnOptions: (m.options || []).join("|"),
          plnCalMin: m.calMin ?? 0,
          plnCalMax: m.calMax ?? 0,
          plnTip: m.tip ?? "",
        })),
      },
    },
  );
  return {
    clientCode:
      String(pick(data ?? {}, "clientCode", "ClientCode") ?? "") ||
      params.ids.clientCode,
    assessmentCode:
      String(pick(data ?? {}, "assessmentCode", "AssessmentCode") ?? "") ||
      params.ids.assessmentCode,
    status: String(pick(data ?? {}, "status", "Status") ?? "") || undefined,
  };
}

async function markAssessmentComplete(params: {
  assessmentCode?: string;
  savedBy: string;
}): Promise<void> {
  await authedFetch("v1/Client/mark-complete", {
    method: "POST",
    body: {
      assessmentCode: params.assessmentCode,
      savedBy: params.savedBy,
    },
  });
}

export async function finishAssessment(params: {
  ids: AssessmentIds;
  savedBy: string;
  metrics: BodyMetrics | null;
  bmiAlreadySaved: boolean;
}): Promise<void> {
  if (params.metrics && !params.bmiAlreadySaved) {
    await saveBmi({
      assessmentCode: params.ids.assessmentCode,
      savedBy: params.savedBy,
      metrics: params.metrics,
    });
  }
  await markAssessmentComplete({
    assessmentCode: params.ids.assessmentCode,
    savedBy: params.savedBy,
  });
}

function normalizeBmiMeasurement(
  raw?: Record<string, unknown> | null,
): BmiMeasurement {
  if (!raw) return {};
  const bmi = Number(pick(raw, "bmi", "BMI", "bMI") ?? NaN) || undefined;
  return {
    assessmentDate:
      String(pick(raw, "assessmentDate", "AssessmentDate") ?? "").trim() ||
      undefined,
    height: Number(pick(raw, "height", "Height") ?? NaN) || undefined,
    weight: Number(pick(raw, "weight", "Weight") ?? NaN) || undefined,
    bmi: bmi && bmi > 0 ? bmi : undefined,
    bodyFatPct:
      Number(
        pick(raw, "bodyFatPct", "BodyFatPct", "bodyFat", "BodyFat") ?? NaN,
      ) || undefined,
    visceralFat:
      Number(pick(raw, "visceralFat", "VisceralFat") ?? NaN) || undefined,
    skeletalMusclePct:
      Number(
        pick(raw, "skeletalMusclePct", "SkeletalMusclePct", "skeletalMuscle") ??
          NaN,
      ) || undefined,
    restingMetabolism:
      Number(pick(raw, "restingMetabolism", "RestingMetabolism") ?? NaN) ||
      undefined,
    bodyAge: Number(pick(raw, "bodyAge", "BodyAge") ?? NaN) || undefined,
  };
}

export async function fetchBmiReport(params: {
  coachCode: string;
  clientCode?: string;
  assessmentCode?: string;
}): Promise<BmiReport | null> {
  const raw = await authedFetch<Record<string, unknown> | null>(
    "v1/Client/bmi-report",
    {
      method: "GET",
      searchParams: {
        coachCode: params.coachCode,
        clientCode: params.clientCode,
        assessmentCode: params.assessmentCode,
      },
    },
  );
  if (!raw) return null;
  const client = (pick(raw, "client", "Client") ?? {}) as Record<
    string,
    unknown
  >;
  const coach = (pick(raw, "coach", "Coach") ?? {}) as Record<string, unknown>;
  const current = (pick(raw, "current", "Current") ?? {}) as Record<
    string,
    unknown
  >;
  const historyRaw = pick<unknown[]>(raw, "history", "History");
  return {
    client: {
      clientName:
        String(pick(client, "clientName", "ClientName") ?? "") || undefined,
      age: Number(pick(client, "age", "Age") ?? NaN) || undefined,
      gender: String(pick(client, "gender", "Gender") ?? "") || undefined,
      location: String(pick(client, "location", "Location") ?? "") || undefined,
    },
    coach: {
      businessName:
        String(pick(coach, "businessName", "BusinessName") ?? "") || undefined,
      coachName:
        String(pick(coach, "coachName", "CoachName") ?? "") || undefined,
      logoUrl: String(pick(coach, "logoUrl", "LogoUrl") ?? "") || undefined,
      address: String(pick(coach, "address", "Address") ?? "") || undefined,
      email: String(pick(coach, "email", "Email") ?? "") || undefined,
      mobile: String(pick(coach, "mobile", "Mobile") ?? "") || undefined,
    },
    current: normalizeBmiMeasurement(current),
    history:
      Array.isArray(historyRaw) ?
        historyRaw.map((row) =>
          normalizeBmiMeasurement((row ?? {}) as Record<string, unknown>),
        )
      : undefined,
    bmiCategory:
      String(pick(raw, "bmiCategory", "BmiCategory") ?? "") || undefined,
    targetWeight:
      Number(pick(raw, "targetWeight", "TargetWeight") ?? NaN) || undefined,
    weightDelta:
      Number(pick(raw, "weightDelta", "WeightDelta") ?? NaN) || undefined,
    reportDate:
      String(pick(raw, "reportDate", "ReportDate") ?? "") || undefined,
  };
}

export async function fetchDietPlanReport(params: {
  coachCode: string;
  clientCode?: string;
  assessmentCode?: string;
}): Promise<GeneratedDietPlan | null> {
  const raw = await authedFetch<unknown>("v1/Client/diet-plan-report", {
    method: "GET",
    searchParams: {
      coachCode: params.coachCode,
      clientCode: params.clientCode,
      assessmentCode: params.assessmentCode,
    },
  });
  if (raw == null) return null;
  const plan = normalizeGeneratedDietPlan(raw);
  return hasDietPlanContent(plan) ? plan : null;
}

export async function generateDietPlan(params: {
  clientName: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  country: string;
  foodType: string;
  cuisine: string;
  activity: string;
  workType: string;
  sleep: string;
  pregnancy: string;
  medical: string;
  allergies: string;
  goal: string;
  timeline: string;
  notes: string;
  meals: ClientMeals;
}): Promise<GeneratedDietPlan> {
  const m = params.meals;
  const raw = await authedFetch<unknown>("v1/Master/generate-diet-plan", {
    method: "POST",
    body: {
      clientName: params.clientName,
      gender: params.gender,
      age: params.age,
      weight: params.weight,
      height: params.height,
      country: params.country || "IN",
      foodType: params.foodType,
      cuisine: params.cuisine,
      activity: params.activity,
      workType: params.workType,
      sleep: params.sleep,
      pregnancy: params.pregnancy,
      medical: params.medical,
      allergies: params.allergies,
      goal: params.goal,
      timeline: params.timeline,
      notes: params.notes,
      curEM: m.earlyMorning.text,
      curEMCal: Math.round(m.earlyMorning.calories) || 0,
      curBreakfast: m.breakfast.text,
      curBreakfastCal: Math.round(m.breakfast.calories) || 0,
      curMidMorning: m.midMorningSnack.text,
      curMidMorningCal: Math.round(m.midMorningSnack.calories) || 0,
      curLunch: m.lunch.text,
      curLunchCal: Math.round(m.lunch.calories) || 0,
      curEvening: m.eveningSnack.text,
      curEveningCal: Math.round(m.eveningSnack.calories) || 0,
      curDinner: m.dinner.text,
      curDinnerCal: Math.round(m.dinner.calories) || 0,
    },
  });
  return normalizeGeneratedDietPlan(raw);
}

/** Send plaintext: do not client-hash (same as app). */
export async function changeCoachPassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await authedFetch("v1/Coach/change-password", {
    method: "PUT",
    body: {
      currentPassword: params.currentPassword,
      newPassword: params.newPassword,
    },
  });
}

export async function requestForgotPassword(userName: string): Promise<void> {
  const response = await apiFetch<unknown>("/v1/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ userName: userName.trim() }),
    skipAuth: true,
  });
  if (!isApiSuccess(response)) {
    throw new ApiRequestError(
      firstApiError(response) ?? "Could not send reset instructions.",
      400,
      response.errorObj,
    );
  }
}

/** Plaintext new password: same contract as app `resetPassword` (do not client-hash). */
export async function resetCoachPassword(params: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const response = await apiFetch<unknown>("/v1/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token: params.token.trim(),
      newPassword: params.newPassword,
    }),
    skipAuth: true,
  });
  if (!isApiSuccess(response)) {
    throw new ApiRequestError(
      firstApiError(response) ?? "Could not reset password.",
      400,
      response.errorObj,
    );
  }
}
