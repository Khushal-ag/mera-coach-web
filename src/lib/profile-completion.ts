/** Checklist aligned with mera-coach-app `getProfileCompletion` / API visibility rules. */

type ProfileCompletionItem = {
  key: string;
  label: string;
  done: boolean;
};

export type ProfileCompletionInput = {
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
  isProfileVisible?: boolean;
  missingPublicFields?: string[] | null;
};

export type ProfileCompletion = {
  percent: number;
  items: ProfileCompletionItem[];
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
    },
    { key: "name", label: "Coach name", done: hasText(profile.coachName) },
    {
      key: "category",
      label: "Coach category",
      done: hasText(profile.coachTypeCode),
    },
    { key: "city", label: "City", done: hasText(profile.city_Cd) },
    { key: "tagline", label: "Tagline", done: hasText(profile.tagline) },
    {
      key: "description",
      label: "About / description",
      done: hasText(profile.coachDesc),
    },
    {
      key: "services",
      label: "Services",
      done: services.some((code) => hasText(code)),
    },
    {
      key: "experience",
      label: "Years of experience",
      done: enteredNumber(profile.experienceYears),
    },
    {
      key: "clients",
      label: "Happy clients count",
      done: enteredNumber(profile.happyClientCount),
    },
    { key: "pincode", label: "Pincode", done: hasText(profile.pinCode) },
    {
      key: "location",
      label: "Locality or address",
      done: !!locality || !!addLine,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  const missingLabels = items.filter((i) => !i.done).map((i) => i.label);

  const isPublicReady =
    typeof profile.isProfileVisible === "boolean" ?
      profile.isProfileVisible
    : missingLabels.length === 0;

  return { percent, items, isPublicReady, missingLabels };
}
