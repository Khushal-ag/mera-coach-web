/** Checklist aligned with mera-coach-app `getProfileCompletion` / API visibility rules. */

export type ProfileCompletionItem = {
  key: string;
  label: string;
  done: boolean;
  where: string;
};

type ProfileCompletionInput = {
  coachName?: string | null;
  coachTypeCode?: string | null;
  city_Cd?: string | null;
  tagline?: string | null;
  coachDesc?: string | null;
  serviceCodes?: string[] | null;
  experienceYears?: number | null;
  happyClientCount?: number | null;
  pinCode?: string | null;
  locality?: string | null;
  add_Line?: string | null;
  profile_Pic_Url?: string | null;
  brandCode?: string | null;
  isProfileVisible?: boolean;
  missingPublicFields?: string[] | null;
};

export type ProfileCompletion = {
  percent: number;
  items: ProfileCompletionItem[];
  doneCount: number;
  totalCount: number;
  isPublicReady: boolean;
  missingLabels: string[];
};

function hasText(value: unknown): boolean {
  return !!String(value ?? "").trim();
}

function enteredNumber(value: number | null | undefined): boolean {
  return value != null && Number.isFinite(value);
}

export function getProfileCompletion(
  profile: ProfileCompletionInput,
): ProfileCompletion {
  const addLine = String(profile.add_Line ?? "").trim();
  const locality = String(profile.locality ?? "").trim();
  const services = profile.serviceCodes ?? [];

  const items: ProfileCompletionItem[] = [
    {
      key: "photo",
      label: "Profile photo",
      done: hasText(profile.profile_Pic_Url),
      where: "Name & photo",
    },
    {
      key: "name",
      label: "Coach name",
      done: hasText(profile.coachName),
      where: "Name & photo",
    },
    {
      key: "category",
      label: "Coach category",
      done: hasText(profile.coachTypeCode),
      where: "Set at sign up",
    },
    {
      key: "city",
      label: "City",
      done: hasText(profile.city_Cd),
      where: "Address (filled from pincode)",
    },
    {
      key: "tagline",
      label: "Tagline",
      done: hasText(profile.tagline),
      where: "Professional details",
    },
    {
      key: "brand",
      label: "Product brand",
      done: hasText(profile.brandCode),
      where: "Professional details",
    },
    {
      key: "description",
      label: "About / description",
      done: hasText(profile.coachDesc),
      where: "Professional details",
    },
    {
      key: "services",
      label: "Services",
      done: services.some((code) => hasText(code)),
      where: "Professional details",
    },
    {
      key: "experience",
      label: "Years of experience",
      done: enteredNumber(profile.experienceYears),
      where: "Professional details",
    },
    {
      key: "clients",
      label: "Happy clients count",
      done: enteredNumber(profile.happyClientCount),
      where: "Professional details",
    },
    {
      key: "pincode",
      label: "Pincode",
      done: hasText(profile.pinCode),
      where: "Address",
    },
    {
      key: "location",
      label: "Locality or address",
      done: !!locality || !!addLine,
      where: "Address",
    },
  ];

  // Saved-row list from the API. Same labels as CoachDAL; this is why Find a Coach omits the coach.
  if (Array.isArray(profile.missingPublicFields)) {
    const missing = new Set(profile.missingPublicFields);
    for (const item of items) item.done = !missing.has(item.label);
  }

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const percent = Math.round((doneCount / totalCount) * 100);
  const missingLabels = items.filter((i) => !i.done).map((i) => i.label);

  const localReady = missingLabels.length === 0;
  const isPublicReady =
    profile.isProfileVisible === true ? true
    : profile.isProfileVisible === false ? false
    : localReady;

  return {
    percent,
    items,
    doneCount,
    totalCount,
    isPublicReady,
    missingLabels,
  };
}
