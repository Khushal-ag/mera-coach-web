import { describe, expect, test } from "bun:test";

import type { CoachProfile } from "@/types/coach";

import { profileDraftKey, profileTextFromCoach } from "../profile-draft";

const baseCoach = {
  coachName: "Test Coach",
  businessName: "",
  tagline: "",
  coachDesc: "About me",
  coachTypeCode: "FIT",
  serviceCodes: ["A", "B"],
  locality: "",
  add_Line: "123 Main",
  city_Cd: "Mumbai",
  state_Cd: "MH",
  country_Cd: "IN",
  pinCode: "400001",
  mobile: "9876543210",
  email: "coach@example.com",
  localLanguage: "",
  bmiReportTemplate: "",
  dietChartTemplate: "",
  recheckupDays: 7,
  experienceYears: 5,
  happyClientCount: 10,
  certificationCount: 0,
} as CoachProfile;

describe("profileDraftKey", () => {
  test("matches loaded text when form state is unchanged", () => {
    const text = profileTextFromCoach(baseCoach);
    const key = profileDraftKey({
      ...text,
      logoPick: false,
      photoPick: false,
      coverPick: false,
    });
    const again = profileDraftKey({
      ...text,
      logoPick: false,
      photoPick: false,
      coverPick: false,
    });
    expect(key).toBe(again);
  });

  test("detects media picks as dirty", () => {
    const text = profileTextFromCoach(baseCoach);
    const clean = profileDraftKey({
      ...text,
      logoPick: false,
      photoPick: false,
      coverPick: false,
    });
    const withPhoto = profileDraftKey({
      ...text,
      logoPick: false,
      photoPick: true,
      coverPick: false,
    });
    expect(clean).not.toBe(withPhoto);
  });
});
