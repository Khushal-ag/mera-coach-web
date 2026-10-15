"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PickedImage } from "@/components/media/image-picker";
import type { MasterOption } from "@/lib/api/master";
import type { CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { env } from "@/config/env";
import { usePinLocationLookup } from "@/hooks/use-pin-location-lookup";
import { useScrollTopOnChange } from "@/hooks/use-scroll-top-on-change";
import { updateCoachMedia } from "@/lib/api/coach";
import { uploadDocument } from "@/lib/api/document";
import {
  fetchCoachCategories,
  fetchServicesForCategory,
} from "@/lib/api/master";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import {
  fetchAuthedCoachProfile,
  saveCoachProfileEssentials,
} from "@/lib/api/practice";
import { refreshPremiumStatus } from "@/lib/auth/premium-status";
import { saveSession } from "@/lib/auth/session";
import {
  fileToBase64DataUrl,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { premiumHref } from "@/lib/premium-link";
import { getProfileCompletion } from "@/lib/profile-completion";
import {
  validateEmail,
  validateMobile,
  validateRequired,
} from "@/lib/validation";

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
  experienceYears: string;
  happyClients: string;
  certifications: string;
  bmiTemplate: string;
  dietTemplate: string;
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
    experienceYears:
      coach.experienceYears != null ? String(coach.experienceYears) : "",
    happyClients:
      coach.happyClientCount != null ? String(coach.happyClientCount) : "",
    certifications:
      coach.certificationCount != null ? String(coach.certificationCount) : "",
    bmiTemplate: coach.bmiReportTemplate ?? "",
    dietTemplate: coach.dietChartTemplate ?? "",
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
    experienceYears: String(Number(draft.experienceYears) || 0),
    happyClients: String(Number(draft.happyClients) || 0),
    certifications: String(Number(draft.certifications) || 0),
    bmiTemplate: draft.bmiTemplate.trim(),
    dietTemplate: draft.dietTemplate.trim(),
  });
}

/** State and actions for the coach profile page: view, edit steps and save. */
export function useProfileEditor() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [premiumLabel, setPremiumLabel] = useState<string>("…");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editStep, setEditStep] = useState(1);
  useScrollTopOnChange(editStep);
  const [savedKey, setSavedKey] = useState("");
  const [baseline, setBaseline] = useState<ProfileText | null>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  const editingRef = useRef(false);
  editingRef.current = editing;

  const [categories, setCategories] = useState<MasterOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<MasterOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [coachName, setCoachName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [coachDesc, setCoachDesc] = useState("");
  const [coachTypeCode, setCoachTypeCode] = useState("");
  const [serviceCodes, setServiceCodes] = useState<string[]>([]);
  const [locality, setLocality] = useState("");
  const [addLine, setAddLine] = useState("");
  const [city, setCity] = useState("");
  const [stateCd, setStateCd] = useState("");
  const [countryCd, setCountryCd] = useState("IN");
  const [pinCode, setPinCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [localLanguage, setLocalLanguage] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [happyClients, setHappyClients] = useState("");
  const [certifications, setCertifications] = useState("");
  const [bmiTemplate, setBmiTemplate] = useState("");
  const [dietTemplate, setDietTemplate] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [logoPick, setLogoPick] = useState<PickedImage | null>(null);
  const [photoPick, setPhotoPick] = useState<PickedImage | null>(null);
  const [coverPick, setCoverPick] = useState<PickedImage | null>(null);

  const pinLookup = usePinLocationLookup(pinCode, countryCd || "IN", (loc) => {
    if (loc.city) setCity(loc.city);
    if (loc.state) setStateCd(loc.state);
  });

  const publicUrl = useMemo(() => {
    const code = session?.coachCode || profile?.coachCode;
    if (!code) return null;
    return `${env.siteUrl.replace(/\/$/, "")}/coach/${encodeURIComponent(code)}`;
  }, [session?.coachCode, profile?.coachCode]);

  const completion = useMemo(
    () =>
      getProfileCompletion({
        coachName,
        coachTypeCode,
        city_Cd: city,
        tagline,
        coachDesc,
        serviceCodes,
        experienceYears: enteredCount(experienceYears),
        happyClientCount: enteredCount(happyClients),
        pinCode,
        locality,
        add_Line: addLine,
        profile_Pic_Url: profilePicUrl,
        isProfileVisible: profile?.isProfileVisible,
        missingPublicFields: profile?.missingPublicFields,
      }),
    [
      coachName,
      coachTypeCode,
      city,
      tagline,
      coachDesc,
      serviceCodes,
      experienceYears,
      happyClients,
      pinCode,
      locality,
      addLine,
      profilePicUrl,
      profile?.isProfileVisible,
      profile?.missingPublicFields,
    ],
  );

  const profileDirty = useMemo(() => {
    if (!profile || !savedKey) return false;
    return (
      profileDraftKey({
        coachName,
        businessName,
        tagline,
        coachDesc,
        coachTypeCode,
        serviceCodes,
        locality,
        addLine,
        city,
        stateCd,
        countryCd,
        pinCode,
        mobile,
        email,
        localLanguage,
        experienceYears,
        happyClients,
        certifications,
        bmiTemplate,
        dietTemplate,
        logoPick: Boolean(logoPick),
        photoPick: Boolean(photoPick),
        coverPick: Boolean(coverPick),
      }) !== savedKey
    );
  }, [
    profile,
    savedKey,
    coachName,
    businessName,
    tagline,
    coachDesc,
    coachTypeCode,
    serviceCodes,
    locality,
    addLine,
    city,
    stateCd,
    countryCd,
    pinCode,
    mobile,
    email,
    localLanguage,
    experienceYears,
    happyClients,
    certifications,
    bmiTemplate,
    dietTemplate,
    logoPick,
    photoPick,
    coverPick,
  ]);

  useEffect(() => {
    void fetchCoachCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!coachTypeCode) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setServicesLoading(true);
      void fetchServicesForCategory(coachTypeCode)
        .then((opts) => {
          if (!cancelled) setServiceOptions(opts);
        })
        .finally(() => {
          if (!cancelled) setServicesLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [coachTypeCode]);

  const visibleServiceOptions = coachTypeCode ? serviceOptions : [];

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchAuthedCoachProfile(),
      refreshPremiumStatus().catch(() => undefined),
    ])
      .then(([p, paid]) => {
        if (cancelled) return;
        if (p) {
          const loaded = profileTextFromCoach(p, session?.email);
          setProfile(p);
          setLogoUrl(p.logo_Url ?? null);
          setProfilePicUrl(p.profile_Pic_Url ?? null);
          setCoverUrl(p.cover_Url ?? null);
          if (!editingRef.current) {
            writeProfileText(loaded);
            setBaseline(loaded);
            setSavedKey(
              profileDraftKey({
                ...loaded,
                logoPick: false,
                photoPick: false,
                coverPick: false,
              }),
            );
          }
        }
        if (typeof paid === "boolean") {
          setPremiumLabel(paid ? "Active" : "Free plan");
        } else {
          setPremiumLabel("Status unavailable");
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load profile.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [session?.email]);

  function writeProfileText(draft: ProfileText) {
    setCoachName(draft.coachName);
    setBusinessName(draft.businessName);
    setTagline(draft.tagline);
    setCoachDesc(draft.coachDesc);
    setCoachTypeCode(draft.coachTypeCode);
    setServiceCodes([...draft.serviceCodes]);
    setLocality(draft.locality);
    setAddLine(draft.addLine);
    setCity(draft.city);
    setStateCd(draft.stateCd);
    setCountryCd(draft.countryCd);
    setPinCode(draft.pinCode);
    setMobile(draft.mobile);
    setEmail(draft.email);
    setLocalLanguage(draft.localLanguage);
    setExperienceYears(draft.experienceYears);
    setHappyClients(draft.happyClients);
    setCertifications(draft.certifications);
    setBmiTemplate(draft.bmiTemplate);
    setDietTemplate(draft.dietTemplate);
  }

  function currentProfileText(): ProfileText {
    return {
      coachName,
      businessName,
      tagline,
      coachDesc,
      coachTypeCode,
      serviceCodes,
      locality,
      addLine,
      city,
      stateCd,
      countryCd,
      pinCode,
      mobile,
      email,
      localLanguage,
      experienceYears,
      happyClients,
      certifications,
      bmiTemplate,
      dietTemplate,
    };
  }

  function showProfileView() {
    setEditing(false);
    pageTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEdit() {
    setError(null);
    setMessage(null);
    setEditStep(1);
    setEditing(true);
  }

  function cancelEdit() {
    if (baseline) writeProfileText(baseline);
    setSlot("logo", null);
    setSlot("photo", null);
    setSlot("cover", null);
    setError(null);
    setMessage(null);
    showProfileView();
  }

  function setSlot(slot: "logo" | "photo" | "cover", file: File | null) {
    setError(null);
    const setter =
      slot === "logo" ? setLogoPick
      : slot === "photo" ? setPhotoPick
      : setCoverPick;
    if (!file) {
      setter((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
      return;
    }
    const invalid = validateRegisterImage(file);
    if (invalid) {
      setError(invalid.message);
      return;
    }
    const next: PickedImage = {
      file,
      previewUrl: URL.createObjectURL(file),
    };
    setter((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return next;
    });
  }

  async function uploadMediaIfNeeded(): Promise<{
    logo_Url?: string;
    profile_Pic_Url?: string;
    cover_Url?: string;
  }> {
    const coachCode = session?.coachCode || profile?.coachCode;
    const coachId = session?.coachId || profile?.coachId;
    if (!coachCode || !coachId) return {};

    let nextLogo = logoUrl ?? undefined;
    let nextPhoto = profilePicUrl ?? undefined;
    let nextCover = coverUrl ?? undefined;

    if (logoPick) {
      const dataUrl = await fileToBase64DataUrl(logoPick.file);
      const uploaded = await uploadDocument({
        base64DataUrl: dataUrl,
        coachCode,
        refCode: coachCode,
        refType: "COACH",
        docType: "LOGO",
        savedBy: coachId,
      });
      nextLogo = uploaded.url;
    }
    if (photoPick) {
      const dataUrl = await fileToBase64DataUrl(photoPick.file);
      const uploaded = await uploadDocument({
        base64DataUrl: dataUrl,
        coachCode,
        refCode: coachCode,
        refType: "COACH",
        docType: "PROFILE_PIC",
        savedBy: coachId,
      });
      nextPhoto = uploaded.url;
    }
    if (coverPick) {
      const dataUrl = await fileToBase64DataUrl(coverPick.file);
      const uploaded = await uploadDocument({
        base64DataUrl: dataUrl,
        coachCode,
        refCode: coachCode,
        refType: "COACH",
        docType: "COVER",
        savedBy: coachId,
      });
      nextCover = uploaded.url;
    }

    if (logoPick || photoPick || coverPick) {
      const mediaRes = await updateCoachMedia({
        coachId,
        logo_Url: nextLogo,
        profile_Pic_Url: nextPhoto,
        cover_Url: nextCover,
      });
      if (!isApiSuccess(mediaRes)) {
        throw new Error(
          firstApiError(mediaRes) ?? "Could not save profile images.",
        );
      }
      setLogoUrl(nextLogo ?? null);
      setProfilePicUrl(nextPhoto ?? null);
      setCoverUrl(nextCover ?? null);
      setSlot("logo", null);
      setSlot("photo", null);
      setSlot("cover", null);
    }

    return {
      logo_Url: nextLogo,
      profile_Pic_Url: nextPhoto,
      cover_Url: nextCover,
    };
  }

  async function save() {
    if (!profile || !profileDirty) return;
    const problems: Array<[number, string | null]> = [
      [1, validateRequired(coachName, "Display name")],
      [1, coachTypeCode ? null : "Please select a coach category."],
      [1, validateMobile(mobile)],
      [1, validateEmail(email, true)],
      [2, validateRequired(experienceYears, "Experience")],
      [2, validateRequired(happyClients, "Happy clients")],
      [
        3,
        pinCode.trim().length === 6 && /^\d+$/.test(pinCode.trim()) ?
          null
        : "Please enter a valid 6-digit PIN code.",
      ],
      [3, validateRequired(addLine, "Address line")],
      [4, validateRequired(coachDesc, "About")],
    ];
    const firstProblem = problems.find(([, message]) => message);
    if (firstProblem) {
      setEditStep(firstProblem[0]);
      setMessage(null);
      setError(firstProblem[1]);
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const media = await uploadMediaIfNeeded();
      await saveCoachProfileEssentials({
        profile,
        coachName: coachName.trim(),
        tagline: tagline.trim(),
        coachDesc: coachDesc.trim(),
        locality: locality.trim(),
        city_Cd: city.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        businessName: businessName.trim(),
        add_Line: addLine.trim(),
        state_Cd: stateCd.trim(),
        country_Cd: countryCd.trim(),
        pinCode: pinCode.trim(),
        localLanguage: localLanguage.trim(),
        experienceYears: Number(experienceYears) || 0,
        happyClientCount: Number(happyClients) || 0,
        certificationCount: Number(certifications) || 0,
        coachTypeCode: coachTypeCode.trim(),
        serviceCodes,
        logo_Url: media.logo_Url ?? logoUrl,
        profile_Pic_Url: media.profile_Pic_Url ?? profilePicUrl,
        cover_Url: media.cover_Url ?? coverUrl,
        bmiReportTemplate: bmiTemplate.trim(),
        dietChartTemplate: dietTemplate.trim(),
      });
      let refreshed: CoachProfile | null = null;
      try {
        refreshed = await fetchAuthedCoachProfile();
      } catch {
        refreshed = null;
      }
      setProfile(
        refreshed ??
          (profile ?
            {
              ...profile,
              coachTypeCode,
              serviceCodes,
              logo_Url: media.logo_Url ?? logoUrl,
              profile_Pic_Url: media.profile_Pic_Url ?? profilePicUrl,
              cover_Url: media.cover_Url ?? coverUrl,
            }
          : profile),
      );
      const finalPhoto =
        refreshed?.profile_Pic_Url ?? media.profile_Pic_Url ?? profilePicUrl;
      const finalName = refreshed?.coachName ?? coachName.trim();
      if (session) {
        saveSession({
          ...session,
          profileUrl: finalPhoto || session.profileUrl,
          fullName: finalName || session.fullName,
        });
      }
      setMessage("Profile saved.");
      const saved = currentProfileText();
      setBaseline(saved);
      setSavedKey(
        profileDraftKey({
          ...saved,
          logoPick: false,
          photoPick: false,
          coverPick: false,
        }),
      );
      showProfileView();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  const premiumLink = premiumHref(session);

  const categoryLabel =
    categories.find((option) => option.code === coachTypeCode)?.label?.trim() ||
    profile?.coachTypeName?.trim() ||
    "";
  const serviceLabels = (() => {
    const fromOptions = serviceCodes
      .map((code) =>
        serviceOptions.find((option) => option.code === code)?.label?.trim(),
      )
      .filter((label): label is string => Boolean(label));
    if (fromOptions.length && fromOptions.length === serviceCodes.length) {
      return fromOptions;
    }
    const fromProfile = (profile?.serviceNames ?? "")
      .split(/[,|]/)
      .map((name) => name.trim())
      .filter(Boolean);
    return fromProfile.length ? fromProfile : fromOptions;
  })();
  const placeLabel = [city.trim(), stateCd.trim()].filter(Boolean).join(", ");
  const displayName = coachName.trim() || "Your profile";
  const coverSrc = resolveMediaUrl(coverUrl);
  const photoSrc = resolveMediaUrl(profilePicUrl);
  const logoSrc = resolveMediaUrl(logoUrl);
  const aboutText = coachDesc.trim();

  return {
    session,
    profile,
    setProfile,
    premiumLabel,
    setPremiumLabel,
    error,
    setError,
    message,
    setMessage,
    busy,
    setBusy,
    editing,
    setEditing,
    editStep,
    setEditStep,
    savedKey,
    setSavedKey,
    baseline,
    setBaseline,
    categories,
    setCategories,
    serviceOptions,
    setServiceOptions,
    servicesLoading,
    setServicesLoading,
    coachName,
    setCoachName,
    businessName,
    setBusinessName,
    tagline,
    setTagline,
    coachDesc,
    setCoachDesc,
    coachTypeCode,
    setCoachTypeCode,
    serviceCodes,
    setServiceCodes,
    locality,
    setLocality,
    addLine,
    setAddLine,
    city,
    setCity,
    stateCd,
    setStateCd,
    countryCd,
    setCountryCd,
    pinCode,
    setPinCode,
    mobile,
    setMobile,
    email,
    setEmail,
    localLanguage,
    setLocalLanguage,
    experienceYears,
    setExperienceYears,
    happyClients,
    setHappyClients,
    certifications,
    setCertifications,
    bmiTemplate,
    setBmiTemplate,
    dietTemplate,
    setDietTemplate,
    logoUrl,
    setLogoUrl,
    profilePicUrl,
    setProfilePicUrl,
    coverUrl,
    setCoverUrl,
    logoPick,
    setLogoPick,
    photoPick,
    setPhotoPick,
    coverPick,
    setCoverPick,
    writeProfileText,
    currentProfileText,
    showProfileView,
    startEdit,
    cancelEdit,
    setSlot,
    uploadMediaIfNeeded,
    save,
    pageTopRef,
    editingRef,
    pinLookup,
    publicUrl,
    completion,
    profileDirty,
    visibleServiceOptions,
    premiumLink,
    categoryLabel,
    serviceLabels,
    placeLabel,
    displayName,
    coverSrc,
    photoSrc,
    logoSrc,
    aboutText,
  };
}

export type ProfileEditor = ReturnType<typeof useProfileEditor>;
