import type { CoachProfile } from "@/types/coach";

/** Empty input is missing. 0 is a saved value and still counts, matching the API. */
export function enteredCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export type ProfileDraft = {
  coachName: string;
  businessName: string;
  tagline: string;
  coachDesc: string;
  coachTypeCode: string;
  serviceCodes: string[];
  locality: string;
  addLine: string;
  city: string;
  stateCd: string;
  countryCd: string;
  pinCode: string;
  mobile: string;
  email: string;
  localLanguage: string;
  brandCode: string;
  bmiTemplate: string;
  dietTemplate: string;
  recheckupDays: string;
  experienceYears: string;
  happyClients: string;
  certifications: string;
  logoPick: boolean;
  photoPick: boolean;
  coverPick: boolean;
};

export type ProfileText = Omit<
  ProfileDraft,
  "logoPick" | "photoPick" | "coverPick"
>;

export function profileTextFromCoach(
  coach: CoachProfile,
  emailFallback?: string | null,
): ProfileText {
  return {
    coachName: coach.coachName ?? "",
    businessName: coach.businessName ?? "",
    tagline: coach.tagline ?? "",
    coachDesc: coach.coachDesc ?? "",
    coachTypeCode: coach.coachTypeCode ?? "",
    serviceCodes: coach.serviceCodes ?? [],
    locality: coach.locality ?? "",
    addLine: coach.add_Line ?? "",
    city: coach.city_Cd ?? "",
    stateCd: coach.state_Cd ?? "",
    countryCd: coach.country_Cd || "IN",
    pinCode: coach.pinCode ?? "",
    mobile: coach.mobile ?? "",
    email: coach.email ?? emailFallback ?? "",
    localLanguage: coach.localLanguage ?? "",
    brandCode: coach.brandCode ?? "",
    bmiTemplate: coach.bmiReportTemplate ?? "",
    dietTemplate: coach.dietChartTemplate ?? "",
    recheckupDays: String(coach.recheckupDays ?? 7),
    experienceYears:
      coach.experienceYears != null ? String(coach.experienceYears) : "",
    happyClients:
      coach.happyClientCount != null ? String(coach.happyClientCount) : "",
    certifications:
      coach.certificationCount != null ? String(coach.certificationCount) : "",
  };
}

export function profileDraftKey(draft: ProfileDraft) {
  return JSON.stringify({
    ...draft,
    coachName: draft.coachName.trim(),
    businessName: draft.businessName.trim(),
    tagline: draft.tagline.trim(),
    coachDesc: draft.coachDesc.trim(),
    coachTypeCode: draft.coachTypeCode.trim(),
    serviceCodes: [...draft.serviceCodes].sort(),
    locality: draft.locality.trim(),
    addLine: draft.addLine.trim(),
    city: draft.city.trim(),
    stateCd: draft.stateCd.trim(),
    countryCd: draft.countryCd.trim(),
    pinCode: draft.pinCode.trim(),
    mobile: draft.mobile.trim(),
    email: draft.email.trim(),
    localLanguage: draft.localLanguage.trim(),
    brandCode: draft.brandCode.trim(),
    bmiTemplate: draft.bmiTemplate.trim(),
    dietTemplate: draft.dietTemplate.trim(),
    recheckupDays: String(Number(draft.recheckupDays) || 7),
    experienceYears: String(Number(draft.experienceYears) || 0),
    happyClients: String(Number(draft.happyClients) || 0),
    certifications: String(Number(draft.certifications) || 0),
  });
}
