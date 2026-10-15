"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { PickedImage } from "@/components/media/image-picker";
import type { MasterOption } from "@/lib/api/master";
import type { CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { CoachPhoto } from "@/components/coach-photo";
import { ProfileCoverImage } from "@/components/coach-profile/profile-cover-image";
import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";
import { ImagePicker } from "@/components/media/image-picker";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PhotoGallery } from "@/components/practice/photo-gallery";
import { ServiceMultiSelect } from "@/components/practice/service-multi-select";
import { SupportActions } from "@/components/practice/support-dialog";
import {
  ProfileFormSkeleton,
  ProfileViewSkeleton,
} from "@/components/skeletons/profile-view-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextAreaField } from "@/components/ui/field";
import { MenuSelect } from "@/components/ui/menu-select";
import { env } from "@/config/env";
import { usePinLocationLookup } from "@/hooks/use-pin-location-lookup";
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
import {
  fileToBase64DataUrl,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { getProfileCompletion } from "@/lib/profile-completion";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validateMobile,
  validateRequired,
} from "@/lib/validation";
import {
  COACH_GALLERY_DOC_TYPE,
  COACH_GALLERY_MAX_PHOTOS,
  COACH_GALLERY_REF_TYPE,
} from "@/types/document";

/** Empty input is missing. 0 is a saved value and still counts, matching the API. */
function enteredCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

type ProfileDraft = {
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

type ProfileText = Omit<ProfileDraft, "logoPick" | "photoPick" | "coverPick">;

function profileTextFromCoach(
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

function LogoMark({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const [tracked, setTracked] = useState(src);
  if (src !== tracked) {
    setTracked(src);
    setFailed(false);
  }
  if (!src || failed) return null;
  return (
    <span className="absolute -right-1 -bottom-1 size-11 overflow-hidden rounded-xl border-2 border-white bg-white shadow-[var(--mc-shadow-sm)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function profileDraftKey(draft: ProfileDraft) {
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

export function ProfileSettingsView() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [premiumLabel, setPremiumLabel] = useState<string>("…");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editStep, setEditStep] = useState(1);
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

  const premiumHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (session?.coachId) qs.set("coachId", String(session.coachId));
    if (session?.coachCode) qs.set("coachCode", session.coachCode);
    return qs.toString() ? `/premium?${qs.toString()}` : "/premium";
  }, [session]);

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

  return (
    <div ref={pageTopRef} className="min-w-0">
      <PracticePageHeader
        title={editing ? "Edit profile" : "Profile"}
        icon={
          <i className="fas fa-user" style={{ fontSize: 20 }} aria-hidden />
        }
        description={
          editing ?
            "Update the photo, name, services, and details on your public page."
          : "How clients see you, plus your gallery and Premium."
        }
        action={
          editing ? null : (
            <button
              type="button"
              className="mc-btn-primary w-full sm:w-auto"
              onClick={startEdit}
              disabled={!profile}
            >
              Edit profile
            </button>
          )
        }
      />

      {error ?
        <AlertBanner tone="error" className="mb-[22px]">
          {error}
        </AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success" className="mb-[22px]">
          {message}
        </AlertBanner>
      : null}

      {!editing && !profile ?
        <ProfileViewSkeleton />
      : null}

      {!editing && profile ?
        <section className="mc-panel overflow-hidden">
          <div className="relative h-40 bg-[image:var(--mc-gradient)] sm:h-48">
            {coverSrc ?
              <ProfileCoverImage src={coverSrc} />
            : null}
          </div>
          <div className="px-5 pb-6 sm:px-6">
            <div className="sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-6">
              <div className="relative z-10 -mt-12 mb-4 size-24 shrink-0 sm:-mt-16 sm:mb-0 sm:size-[7.5rem]">
                <div className="relative size-full overflow-hidden rounded-full border-4 border-white bg-mc-secondary shadow-[0_8px_24px_rgba(27,67,50,0.18)]">
                  <CoachPhoto
                    src={photoSrc || logoSrc}
                    alt=""
                    name={displayName}
                    className="object-cover"
                  />
                </div>
                {logoSrc ?
                  <LogoMark src={logoSrc} />
                : null}
              </div>
              <div className="min-w-0 sm:pt-5">
                <h2 className="font-display text-2xl font-extrabold tracking-tight break-words text-ink sm:text-3xl">
                  {displayName}
                </h2>
                {businessName.trim() && businessName.trim() !== displayName ?
                  <p className="mt-0.5 text-sm break-words text-ink-muted">
                    {businessName.trim()}
                  </p>
                : null}
                <p className="mt-1 text-sm font-semibold break-words text-mc-secondary">
                  {categoryLabel || "Category not set"}
                </p>
                <p className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm break-words text-ink-muted">
                  <i
                    className="fas fa-map-marker-alt"
                    style={{ fontSize: 14 }}
                    aria-hidden
                  />
                  {placeLabel || "City not set"}
                </p>
                {tagline.trim() ?
                  <p className="mt-2 text-sm font-semibold break-words text-[color:var(--mc-accent)]">
                    {tagline.trim()}
                  </p>
                : null}
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-sm font-semibold text-ink-muted">
                    Subscription
                  </span>
                  <span className="rounded-full bg-mc-secondary-light px-2.5 py-1 font-display text-sm font-bold text-mc-secondary">
                    {premiumLabel}
                  </span>
                  <Link
                    href={premiumHref}
                    className="mc-btn-primary min-h-10 shrink-0 px-3.5 text-[13px]"
                  >
                    Manage Premium
                  </Link>
                </div>
              </div>
            </div>

            <h3 className="mt-6 font-display text-lg font-bold tracking-tight text-ink">
              About
            </h3>
            <p
              className={
                aboutText ?
                  "mt-2 max-w-[65ch] text-[15px] leading-relaxed whitespace-pre-wrap text-ink"
                : "mt-2 text-sm text-ink-muted"
              }
            >
              {aboutText || "No about yet."}
            </p>

            <h3 className="mt-6 font-display text-lg font-bold tracking-tight text-ink">
              Services
            </h3>
            {serviceLabels.length ?
              <ul className="mt-3 flex flex-wrap gap-2">
                {serviceLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-full bg-mc-secondary-light px-3 py-1 text-sm font-semibold text-mc-secondary"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            : <p className="mt-2 text-sm text-ink-muted">No services yet.</p>}

            <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:flex-wrap sm:items-center">
              <ShareProfileButton
                coachName={displayName}
                url={publicUrl ?? ""}
                disabled={!publicUrl}
                variant="primary"
                className="w-full sm:w-auto"
              />
              {publicUrl ?
                <Link
                  href={`/coach/${encodeURIComponent(session?.coachCode || profile.coachCode || "")}`}
                  className="mc-btn-secondary w-full sm:w-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View public page
                </Link>
              : null}
            </div>
            <p className="mt-3 max-w-[65ch] text-sm text-ink-muted">
              {profile.isProfileVisible === false ?
                "Find a Coach listing is off until the required public fields are saved."
              : profile.isProfileVisible ?
                "Listed on Find a Coach."
              : "Share this page when you want someone to open your profile."}
            </p>
          </div>
        </section>
      : null}

      {!editing && session?.coachCode ?
        <div className="mt-4">
          <PhotoGallery
            coachCode={session.coachCode}
            refCode={session.coachCode}
            refType={COACH_GALLERY_REF_TYPE}
            docType={COACH_GALLERY_DOC_TYPE}
            savedBy={session.coachId}
            maxPhotos={COACH_GALLERY_MAX_PHOTOS}
            title="Public gallery"
            emptyHint="Add photos for your public coach profile gallery."
          />
        </div>
      : null}

      {(
        !editing &&
        profile &&
        (profile.isProfileVisible === false || completion.percent < 100)
      ) ?
        <div className="mt-4 grid gap-4">
          {profile.isProfileVisible === false ?
            <div className="mc-panel flex items-baseline justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-ink">
                  Find a Coach listing is off
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {completion.missingLabels.length ?
                    `Save these details on this profile: ${completion.missingLabels.join(", ")}. Find a Coach lists a profile once every required field is saved.`
                  : "Save this profile again. Find a Coach lists a profile once every required field is saved."
                  }
                </p>
              </div>
              <p className="font-display text-3xl font-bold text-ink tabular-nums">
                {completion.percent}%
              </p>
            </div>
          : profile && completion.percent < 100 ?
            <div className="mc-panel flex items-baseline justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-ink">
                  Profile completion
                </p>
                {completion.missingLabels.length ?
                  <p className="mt-1 text-sm text-ink-muted">
                    Still needed: {completion.missingLabels.join(", ")}
                  </p>
                : null}
              </div>
              <p className="font-display text-3xl font-bold text-ink tabular-nums">
                {completion.percent}%
              </p>
            </div>
          : null}
        </div>
      : null}

      {editing ?
        !profile ?
          <ProfileFormSkeleton />
        : <div className="mc-public">
            <div className="rg-page" style={{ padding: 0, maxWidth: 860 }}>
              <form
                className="rg-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editStep === 4) void save();
                }}
              >
                <div className="rg-card-head">
                  <div className="rg-head-blobs">
                    <div className="rg-hb rg-hb-1" />
                    <div className="rg-hb rg-hb-2" />
                  </div>
                  <div className="rg-head-inner">
                    <div className="rg-head-icon">
                      <i className="fas fa-chalkboard-teacher" />
                    </div>
                    <div>
                      <h1>My Profile</h1>
                      <p>
                        Keep your profile up to date to attract more clients
                      </p>
                    </div>
                  </div>
                  <div className="rg-steps" style={{ display: "flex" }}>
                    <div
                      className={cn(
                        "rg-step",
                        editStep === 1 ? "rg-step-active" : "",
                        editStep > 1 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(1)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">1</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Basic Info</span>
                    </div>
                    <div className="rg-step-line" />
                    <div
                      className={cn(
                        "rg-step",
                        editStep === 2 ? "rg-step-active" : "",
                        editStep > 2 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(2)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">2</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Coach Details</span>
                    </div>
                    <div className="rg-step-line" />
                    <div
                      className={cn(
                        "rg-step",
                        editStep === 3 ? "rg-step-active" : "",
                        editStep > 3 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(3)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">3</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Contact</span>
                    </div>
                    <div className="rg-step-line" />
                    <div
                      className={cn(
                        "rg-step",
                        editStep === 4 ? "rg-step-active" : "",
                        editStep > 4 ? "rg-step-complete" : "",
                      )}
                      onClick={() => setEditStep(4)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rg-step-circle">
                        <span className="rg-step-num">4</span>
                        <i className="fas fa-check rg-step-done" />
                      </div>
                      <span>Profile</span>
                    </div>
                  </div>
                </div>
                <div className="rg-card-body">
                  <div
                    className={cn(
                      "rg-panel",
                      editStep === 1 ? "" : "rg-hidden",
                    )}
                  >
                    <div className="rg-section-head">
                      <div className="rg-sh-icon rg-sh-green">
                        <i className="fas fa-user-check" />
                      </div>
                      <div>
                        <h2>Basic Information</h2>
                        <p>Core identity and login details</p>
                      </div>
                    </div>
                    <div className="rg-grid">
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-user" /> Display name
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={coachName}
                          onChange={(e) => setCoachName(e.target.value)}
                          aria-required="true"
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-layer-group" /> Coach category
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <MenuSelect
                          skin="public"
                          className="ui-select"
                          value={coachTypeCode}
                          options={[
                            { value: "", label: "-- Select a category --" },
                            ...categories.map((c) => ({
                              value: c.code,
                              label: c.label,
                            })),
                          ]}
                          onChange={(e) => {
                            setCoachTypeCode(e.target.value);
                            setServiceCodes([]);
                          }}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-mobile-alt" /> Mobile number
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          maxLength={10}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-envelope" /> Email address
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                        />
                      </div>
                    </div>
                    <div className="rg-nav">
                      <button
                        type="button"
                        className="btn rg-btn-next"
                        onClick={() => setEditStep(2)}
                      >
                        Next: Coach Details <i className="fas fa-arrow-right" />
                      </button>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rg-panel",
                      editStep === 2 ? "" : "rg-hidden",
                    )}
                  >
                    <div className="rg-section-head">
                      <div className="rg-sh-icon rg-sh-gold">
                        <i className="fas fa-briefcase" />
                      </div>
                      <div>
                        <h2>Coach Details</h2>
                        <p>Your expertise, services and experience</p>
                      </div>
                    </div>
                    <div className="rg-grid">
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-building" /> Business name
                        </label>
                        <input
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-quote-left" /> Tagline
                        </label>
                        <input
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-award" /> Experience (years)
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          type="number"
                          min={0}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-smile" /> Happy clients
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={happyClients}
                          onChange={(e) => setHappyClients(e.target.value)}
                          type="number"
                          min={0}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-certificate" /> Certifications
                        </label>
                        <input
                          value={certifications}
                          onChange={(e) => setCertifications(e.target.value)}
                          type="number"
                          min={0}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-language" /> Local language
                        </label>
                        <input
                          value={localLanguage}
                          onChange={(e) => setLocalLanguage(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <ServiceMultiSelect
                        options={visibleServiceOptions}
                        selected={serviceCodes}
                        onChange={setServiceCodes}
                        loading={servicesLoading}
                        disabled={busy || !coachTypeCode}
                        hint="Pick services for your category (same master list as the app)."
                      />
                    </div>
                    <div className="rg-nav">
                      <button
                        type="button"
                        className="btn rg-btn-back"
                        onClick={() => setEditStep(1)}
                      >
                        <i className="fas fa-arrow-left" /> Back
                      </button>
                      <button
                        type="button"
                        className="btn rg-btn-next"
                        onClick={() => setEditStep(3)}
                      >
                        Next: Contact & Location{" "}
                        <i className="fas fa-arrow-right" />
                      </button>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rg-panel",
                      editStep === 3 ? "" : "rg-hidden",
                    )}
                  >
                    <div className="rg-section-head">
                      <div className="rg-sh-icon rg-sh-green">
                        <i className="fas fa-map-marker-alt" />
                      </div>
                      <div>
                        <h2>Contact & Location</h2>
                        <p>Where clients can find you</p>
                      </div>
                    </div>
                    <div className="rg-grid">
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-map-pin" /> PIN code
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          inputMode="numeric"
                        />
                        {pinLookup.lookingUp ?
                          <span className="rg-field-note">
                            Looking up city…
                          </span>
                        : null}
                        {pinLookup.error ?
                          <span className="rg-field-note">
                            {pinLookup.error}
                          </span>
                        : null}
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-location-arrow" /> Locality
                        </label>
                        <input
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-city" /> City
                        </label>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-map" /> State
                        </label>
                        <input
                          value={stateCd}
                          onChange={(e) => setStateCd(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-globe" /> Country code
                        </label>
                        <input
                          value={countryCd}
                          onChange={(e) => setCountryCd(e.target.value)}
                        />
                      </div>
                      <div className="rg-field rg-col-2">
                        <label>
                          <i className="fas fa-home" /> Address line
                          <span className="rg-req" aria-hidden>
                            *
                          </span>
                        </label>
                        <input
                          value={addLine}
                          onChange={(e) => setAddLine(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="rg-nav">
                      <button
                        type="button"
                        className="btn rg-btn-back"
                        onClick={() => setEditStep(2)}
                      >
                        <i className="fas fa-arrow-left" /> Back
                      </button>
                      <button
                        type="button"
                        className="btn rg-btn-next"
                        onClick={() => setEditStep(4)}
                      >
                        Next: Profile & Media{" "}
                        <i className="fas fa-arrow-right" />
                      </button>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rg-panel",
                      editStep === 4 ? "" : "rg-hidden",
                    )}
                  >
                    <div className="rg-section-head">
                      <div className="rg-sh-icon rg-sh-red">
                        <i className="fas fa-id-card" />
                      </div>
                      <div>
                        <h2>Profile & Media</h2>
                        <p>Photos and what clients read about you</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <ImagePicker
                        label="Cover image"
                        hint="Wide banner for your public profile. JPG, PNG, or WebP · max 2 MB"
                        value={coverPick}
                        currentUrl={coverUrl}
                        onChange={(file) => setSlot("cover", file)}
                        disabled={busy}
                        aspectClassName="h-20 w-36"
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ImagePicker
                          label="Logo"
                          value={logoPick}
                          currentUrl={logoUrl}
                          onChange={(file) => setSlot("logo", file)}
                          disabled={busy}
                        />
                        <ImagePicker
                          label="Profile photo"
                          name={coachName}
                          value={photoPick}
                          currentUrl={profilePicUrl}
                          onChange={(file) => setSlot("photo", file)}
                          disabled={busy}
                        />
                      </div>

                      <TextAreaField
                        label="About"
                        required
                        value={coachDesc}
                        onChange={(e) => setCoachDesc(e.target.value)}
                      />
                      <TextAreaField
                        label="BMI report template notes"
                        value={bmiTemplate}
                        onChange={(e) => setBmiTemplate(e.target.value)}
                      />
                      <TextAreaField
                        label="Diet chart template notes"
                        value={dietTemplate}
                        onChange={(e) => setDietTemplate(e.target.value)}
                      />
                      <div className="rounded-[var(--radius-sm)] border border-line bg-paper px-4 py-3">
                        <p className="text-sm font-semibold text-ink">
                          Find a Coach visibility
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {profile.isProfileVisible ?
                            "Listed. It stays on Find a Coach while the required public fields are filled in."
                          : completion.missingLabels.length ?
                            `Not listed yet. Still needed: ${completion.missingLabels.join(", ")}.`
                          : "Not listed yet. Save again once the required public fields are filled in."
                          }
                        </p>
                      </div>
                    </div>
                    <div className="rg-nav">
                      <button
                        type="button"
                        className="btn rg-btn-back"
                        onClick={() => setEditStep(3)}
                      >
                        <i className="fas fa-arrow-left" /> Back
                      </button>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="btn rg-btn-back"
                          onClick={cancelEdit}
                          disabled={busy}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn rg-btn-next"
                          disabled={busy || !profileDirty}
                          aria-busy={busy}
                        >
                          {busy ? "Saving…" : "Save Profile"}{" "}
                          <i className="fas fa-check" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

      : null}

      {!editing ?
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard/profile/password"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] border-2 border-mc-secondary bg-white px-4 font-display text-[13px] font-semibold text-mc-secondary hover:bg-mc-secondary-light sm:w-auto"
          >
            <i className="fas fa-key" style={{ fontSize: 16 }} aria-hidden />
            Change password
          </Link>
          <SupportActions />
        </div>
      : null}
    </div>
  );
}
