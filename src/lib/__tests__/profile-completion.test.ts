import { describe, expect, it } from "bun:test";

import { getProfileCompletion } from "@/lib/profile-completion";

const completeProfile = {
  profile_Pic_Url: "https://cdn.example/photo.jpg",
  coachName: "Ada",
  coachTypeCode: "NUT",
  city_Cd: "Pune",
  tagline: "Strength first",
  brandCode: "HERBALIFE",
  coachDesc: "Helping clients reach goals",
  serviceCodes: ["SRV1"],
  experienceYears: 5,
  happyClientCount: 20,
  pinCode: "560001",
  add_Line: "12 MG Road",
};

describe("getProfileCompletion", () => {
  it("marks incomplete when required public fields are missing", () => {
    const result = getProfileCompletion({
      experienceYears: null,
      happyClientCount: null,
      coachDesc: "",
      add_Line: "",
      pinCode: "",
      profile_Pic_Url: "",
    });
    expect(result.isPublicReady).toBe(false);
    expect(result.percent).toBe(0);
    expect(result.doneCount).toBe(0);
    expect(result.totalCount).toBe(12);
  });

  it("previews public when every field is present and visibility is unknown", () => {
    const result = getProfileCompletion(completeProfile);
    expect(result.isPublicReady).toBe(true);
    expect(result.percent).toBe(100);
    expect(result.missingLabels).toEqual([]);
  });

  it("respects an explicit public flag even if fields look incomplete", () => {
    const result = getProfileCompletion({
      experienceYears: null,
      isProfileVisible: true,
    });
    expect(result.isPublicReady).toBe(true);
  });

  it("does not say public when the server will hide the profile", () => {
    const result = getProfileCompletion({
      ...completeProfile,
      isProfileVisible: false,
    });
    expect(result.isPublicReady).toBe(false);
  });

  it("uses the server missing-field list when the API sends one", () => {
    const result = getProfileCompletion({
      ...completeProfile,
      isProfileVisible: false,
      missingPublicFields: ["Product brand"],
    });
    expect(result.missingLabels).toEqual(["Product brand"]);
    expect(result.doneCount).toBe(11);
    expect(result.percent).toBe(92);
  });
});
