"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { PickedImage } from "@/components/media/image-picker";
import type { MasterOption } from "@/lib/api/master";
import type { CoachProfile } from "@/types/coach";

import { useAuth } from "@/components/auth-provider";
import { ImagePicker } from "@/components/media/image-picker";
import { PracticePageHeader } from "@/components/practice/page-header";
import { PhotoGallery } from "@/components/practice/photo-gallery";
import { ServiceMultiSelect } from "@/components/practice/service-multi-select";
import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
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
  fetchCoachPremiumOffer,
  saveCoachProfileEssentials,
} from "@/lib/api/practice";
import {
  fileToBase64DataUrl,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { getProfileCompletion } from "@/lib/profile-completion";
import { accountDeletionMailto, supportMailto } from "@/lib/support";
import {
  COACH_GALLERY_DOC_TYPE,
  COACH_GALLERY_MAX_PHOTOS,
  COACH_GALLERY_REF_TYPE,
} from "@/types/document";

async function copyText(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
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
};

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
  const { session, logout } = useAuth();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [premiumLabel, setPremiumLabel] = useState<string>("…");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedKey, setSavedKey] = useState("");
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

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
  const [logoPick, setLogoPick] = useState<PickedImage | null>(null);
  const [photoPick, setPhotoPick] = useState<PickedImage | null>(null);

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
        experienceYears: Number(experienceYears) || null,
        happyClientCount: Number(happyClients) || null,
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
      fetchCoachPremiumOffer().catch(() => null),
    ])
      .then(([p, offer]) => {
        if (cancelled) return;
        if (p) {
          setProfile(p);
          setCoachName(p.coachName ?? "");
          setBusinessName(p.businessName ?? "");
          setTagline(p.tagline ?? "");
          setCoachDesc(p.coachDesc ?? "");
          setCoachTypeCode(p.coachTypeCode ?? "");
          setServiceCodes(p.serviceCodes ?? []);
          setLocality(p.locality ?? "");
          setAddLine(p.add_Line ?? "");
          setCity(p.city_Cd ?? "");
          setStateCd(p.state_Cd ?? "");
          setCountryCd(p.country_Cd || "IN");
          setPinCode(p.pinCode ?? "");
          setMobile(p.mobile ?? "");
          setEmail(p.email ?? session?.email ?? "");
          setLocalLanguage(p.localLanguage ?? "");
          setExperienceYears(
            p.experienceYears != null ? String(p.experienceYears) : "",
          );
          setHappyClients(
            p.happyClientCount != null ? String(p.happyClientCount) : "",
          );
          setCertifications(
            p.certificationCount != null ? String(p.certificationCount) : "",
          );
          setBmiTemplate(p.bmiReportTemplate ?? "");
          setDietTemplate(p.dietChartTemplate ?? "");
          setLogoUrl(p.logo_Url ?? null);
          setProfilePicUrl(p.profile_Pic_Url ?? null);
          setSavedKey(
            profileDraftKey({
              coachName: p.coachName ?? "",
              businessName: p.businessName ?? "",
              tagline: p.tagline ?? "",
              coachDesc: p.coachDesc ?? "",
              coachTypeCode: p.coachTypeCode ?? "",
              serviceCodes: p.serviceCodes ?? [],
              locality: p.locality ?? "",
              addLine: p.add_Line ?? "",
              city: p.city_Cd ?? "",
              stateCd: p.state_Cd ?? "",
              countryCd: p.country_Cd || "IN",
              pinCode: p.pinCode ?? "",
              mobile: p.mobile ?? "",
              email: p.email ?? session?.email ?? "",
              localLanguage: p.localLanguage ?? "",
              experienceYears:
                p.experienceYears != null ? String(p.experienceYears) : "",
              happyClients:
                p.happyClientCount != null ? String(p.happyClientCount) : "",
              certifications:
                p.certificationCount != null ?
                  String(p.certificationCount)
                : "",
              bmiTemplate: p.bmiReportTemplate ?? "",
              dietTemplate: p.dietChartTemplate ?? "",
              logoPick: false,
              photoPick: false,
            }),
          );
        }
        if (offer) {
          setPremiumLabel(
            offer.isPaid ?
              offer.planName || "Premium active"
            : "Free plan, upgrade available",
          );
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

  function setSlot(slot: "logo" | "photo", file: File | null) {
    setError(null);
    const apply = (setter: typeof setLogoPick) => {
      setter((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return null;
      });
    };
    if (!file) {
      if (slot === "logo") apply(setLogoPick);
      else apply(setPhotoPick);
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
    if (slot === "logo") {
      setLogoPick((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return next;
      });
    } else {
      setPhotoPick((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return next;
      });
    }
  }

  async function uploadMediaIfNeeded(): Promise<{
    logo_Url?: string;
    profile_Pic_Url?: string;
  }> {
    const coachCode = session?.coachCode || profile?.coachCode;
    const coachId = session?.coachId || profile?.coachId;
    if (!coachCode || !coachId) return {};

    let nextLogo = logoUrl ?? undefined;
    let nextPhoto = profilePicUrl ?? undefined;

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

    if (logoPick || photoPick) {
      const mediaRes = await updateCoachMedia({
        coachId,
        logo_Url: nextLogo,
        profile_Pic_Url: nextPhoto,
      });
      if (!isApiSuccess(mediaRes)) {
        throw new Error(
          firstApiError(mediaRes) ?? "Could not save profile images.",
        );
      }
      setLogoUrl(nextLogo ?? null);
      setProfilePicUrl(nextPhoto ?? null);
      setSlot("logo", null);
      setSlot("photo", null);
    }

    return { logo_Url: nextLogo, profile_Pic_Url: nextPhoto };
  }

  async function save() {
    if (!profile || !profileDirty) return;
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
        bmiReportTemplate: bmiTemplate.trim(),
        dietChartTemplate: dietTemplate.trim(),
      });
      setProfile((prev) =>
        prev ?
          {
            ...prev,
            coachTypeCode,
            serviceCodes,
            logo_Url: media.logo_Url ?? logoUrl,
            profile_Pic_Url: media.profile_Pic_Url ?? profilePicUrl,
          }
        : prev,
      );
      setMessage("Profile saved.");
      setSavedKey(
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
          logoPick: false,
          photoPick: false,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  async function shareProfile() {
    if (!publicUrl) return;
    const title = `${coachName || session?.fullName || "Coach"} on Mera Coach`;
    const text = `Check out my coaching profile on Mera Coach.`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url: publicUrl });
        setShareFeedback("Shared");
        window.setTimeout(() => setShareFeedback(null), 2000);
        return;
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
    const ok = await copyText(publicUrl);
    setShareFeedback(ok ? "Link copied" : "Could not copy");
    window.setTimeout(() => setShareFeedback(null), 2500);
  }

  const premiumHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (session?.coachId) qs.set("coachId", String(session.coachId));
    if (session?.coachCode) qs.set("coachCode", session.coachCode);
    return qs.toString() ? `/premium?${qs.toString()}` : "/premium";
  }, [session]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PracticePageHeader
        title="Profile"
        description="Public page details, gallery, Premium, and account security."
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}

      <div className="mc-panel flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[color:var(--mc-secondary-dark)]">
            Subscription
          </p>
          <p className="mt-1 font-display font-bold text-ink">{premiumLabel}</p>
          {profile?.isProfileVisible === false ?
            <p className="mt-1 text-xs text-[color:var(--mc-destructive)]">
              Profile is not publicly visible
              {profile.missingPublicFields?.length ?
                ` (missing: ${profile.missingPublicFields.join(", ")})`
              : ""}
              .
            </p>
          : profile?.isProfileVisible ?
            <p className="mt-1 text-xs text-[color:var(--mc-secondary-dark)]">
              Public profile visible in directory.
            </p>
          : null}
        </div>
        <Link
          href={premiumHref}
          className="mc-btn-primary min-h-10 px-4 text-sm"
        >
          Manage Premium
        </Link>
      </div>

      {!completion.isPublicReady || completion.percent < 100 ?
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

      <div className="mc-panel space-y-4 p-4 sm:p-5">
        <div>
          <p className="text-sm font-semibold text-ink">Public profile link</p>
          <p className="mt-1 text-sm text-ink-muted">
            Copy this link when you want clients to open your page.
          </p>
          {publicUrl ?
            <p className="mt-2 truncate text-sm font-medium text-ink">
              {publicUrl}
            </p>
          : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="mc-btn-primary"
            disabled={!publicUrl}
            onClick={() => void shareProfile()}
          >
            {shareFeedback ?? "Copy link"}
          </button>
          {session?.coachCode || profile?.coachCode ?
            <Link
              href={`/coach/${encodeURIComponent(session?.coachCode || profile?.coachCode || "")}`}
              className="mc-btn-secondary"
              target="_blank"
            >
              View public page
            </Link>
          : null}
          <Link href="/dashboard/profile/password" className="mc-btn-secondary">
            Change password
          </Link>
        </div>
      </div>

      {!profile ?
        <div className="mc-panel space-y-3 p-5" aria-busy="true">
          <span className="sr-only">Loading profile</span>
          <div className="mc-skeleton h-4 w-32" />
          <div className="mc-skeleton h-10 w-full" />
          <div className="mc-skeleton h-10 w-full" />
        </div>
      : <form
          className="mc-panel space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
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
              value={photoPick}
              currentUrl={profilePicUrl}
              onChange={(file) => setSlot("photo", file)}
              disabled={busy}
            />
          </div>

          <TextField
            label="Display name"
            value={coachName}
            onChange={(e) => setCoachName(e.target.value)}
            required
          />
          <TextField
            label="Business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <SelectField
            label="Coach category"
            value={coachTypeCode}
            required
            onChange={(e) => {
              setCoachTypeCode(e.target.value);
              setServiceCodes([]);
            }}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </SelectField>
          <ServiceMultiSelect
            options={visibleServiceOptions}
            selected={serviceCodes}
            onChange={setServiceCodes}
            loading={servicesLoading}
            disabled={busy || !coachTypeCode}
            hint="Pick services for your category (same master list as the app)."
          />
          <TextField
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          <TextAreaField
            label="About"
            value={coachDesc}
            onChange={(e) => setCoachDesc(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Locality"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
            <TextField
              label="Address line"
              value={addLine}
              onChange={(e) => setAddLine(e.target.value)}
            />
            <TextField
              label="PIN code"
              value={pinCode}
              inputMode="numeric"
              onChange={(e) => setPinCode(e.target.value)}
              hint={pinLookup.lookingUp ? "Looking up city…" : undefined}
              error={pinLookup.error || undefined}
            />
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <TextField
              label="State"
              value={stateCd}
              onChange={(e) => setStateCd(e.target.value)}
            />
            <TextField
              label="Country code"
              value={countryCd}
              onChange={(e) => setCountryCd(e.target.value)}
            />
            <TextField
              label="Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Local language"
              value={localLanguage}
              onChange={(e) => setLocalLanguage(e.target.value)}
            />
            <TextField
              label="Experience (years)"
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
            <TextField
              label="Happy clients"
              type="number"
              value={happyClients}
              onChange={(e) => setHappyClients(e.target.value)}
            />
            <TextField
              label="Certifications"
              type="number"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
            />
          </div>
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
          <button
            type="submit"
            className="mc-btn-primary w-full"
            disabled={busy || !profileDirty}
            aria-busy={busy}
          >
            {busy ? "Saving" : "Save profile"}
          </button>
        </form>
      }

      {session?.coachCode ?
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
      : null}

      <div className="flex flex-wrap gap-4 border-t border-line pt-4">
        <a
          href={supportMailto()}
          className="text-sm font-semibold text-mc-secondary hover:underline"
        >
          Help &amp; Support
        </a>
        <a
          href={accountDeletionMailto()}
          className="text-sm font-semibold text-[color:var(--mc-destructive)] hover:underline"
        >
          Delete account
        </a>
        <button
          type="button"
          className="text-sm font-semibold text-[color:var(--mc-destructive)]"
          onClick={() => void logout()}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
