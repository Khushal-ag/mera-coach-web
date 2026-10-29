"use client";

import { useEffect, useState } from "react";

import type { MasterOption } from "@/lib/api/master";
import type { CoachRegisterResult } from "@/types/coach";

import { useScrollTopOnChange } from "@/hooks/use-scroll-top-on-change";
import { registerCoach, saveRegisteredCoachDetails } from "@/lib/api/coach";
import { uploadDocument } from "@/lib/api/document";
import {
  fetchLocationByPin,
  fetchMasterOptions,
  fetchServicesForCategory,
} from "@/lib/api/master";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import {
  fileToBase64DataUrl,
  validateRegisterImage,
} from "@/lib/media/image-file";

/** State and actions for the coach registration flow. The step components only render. */
export function useRegisterForm(categories: MasterOption[]) {
  const [step, setStep] = useState(0);
  useScrollTopOnChange(step);
  const [alert, setAlert] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [termsShake, setTermsShake] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [referrerMobile, setReferrerMobile] = useState("");
  const [services, setServices] = useState<MasterOption[]>([]);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [experience, setExperience] = useState("");
  const [clients, setClients] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [countries, setCountries] = useState<MasterOption[]>([]);
  const [country, setCountry] = useState("");
  const [pin, setPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [account, setAccount] = useState<CoachRegisterResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [crop, setCrop] = useState<{
    target: "logo" | "photo";
    url: string;
    file: File;
    title: string;
    hint: string;
  } | null>(null);

  function fieldClass(id: string) {
    return invalid === id ? "rg-invalid" : undefined;
  }

  function clearInvalid(id: string) {
    setInvalid((current) => (current === id ? null : current));
  }

  function validateStep() {
    const rules: {
      id: string;
      value: string;
      msg: string;
      pattern?: RegExp;
      patternMsg?: string;
    }[] = [
      { id: "rgCoachName", value: name.trim(), msg: "Coach Name is required." },
      {
        id: "rgCategory",
        value: category.trim(),
        msg: "Please select a Coach Category.",
      },
      {
        id: "rgMobile",
        value: mobile.trim(),
        msg: "Mobile Number is required.",
        pattern: /^[6-9]\d{9}$/,
        patternMsg:
          "Please enter a valid 10-digit mobile number (starting with 6-9).",
      },
      {
        id: "rgEmail",
        value: email.trim(),
        msg: "Email Address is required.",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMsg: "Enter a valid email address.",
      },
    ];
    for (const rule of rules) {
      if (!rule.value) {
        setAlert(rule.msg);
        setInvalid(rule.id);
        document.getElementById(rule.id)?.focus();
        return false;
      }
      if (rule.pattern && !rule.pattern.test(rule.value)) {
        setAlert(rule.patternMsg ?? rule.msg);
        setInvalid(rule.id);
        document.getElementById(rule.id)?.focus();
        return false;
      }
    }

    if (referrerMobile.trim()) {
      const refVal = referrerMobile.trim();
      if (!/^[6-9]\d{9}$/.test(refVal)) {
        setAlert(
          "Please enter a valid 10-digit referral mobile number (starting with 6-9).",
        );
        setInvalid("rgReferrerMobile");
        document.getElementById("rgReferrerMobile")?.focus();
        return false;
      }
      if (refVal === mobile.trim()) {
        setAlert("Referral mobile cannot be the same as your mobile number.");
        setInvalid("rgReferrerMobile");
        document.getElementById("rgReferrerMobile")?.focus();
        return false;
      }
    }

    setInvalid(null);
    setAlert("");
    return true;
  }

  useEffect(() => {
    let cancelled = false;
    void fetchMasterOptions("Country").then((rows) => {
      if (!cancelled) setCountries(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (step !== 2 || !category) return;
    let cancelled = false;
    void fetchServicesForCategory(category).then((rows) => {
      if (!cancelled) setServices(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [step, category]);

  function showStep(next: number) {
    setAlert("");
    setStep(next);
  }

  async function continueFromStep1() {
    if (!validateStep() || busy) return;
    if (account) {
      showStep(2);
      return;
    }
    setBusy(true);
    try {
      const response = await registerCoach({
        coachName: name.trim(),
        coachTypeCode: category.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        ...(referrerMobile.trim() ?
          { referrerMobile: referrerMobile.trim() }
        : {}),
      });
      if (!isApiSuccess(response) || !response.responseObj) {
        setAlert(
          firstApiError(response) ?? "Registration failed. Please try again.",
        );
        return;
      }
      setAccount(response.responseObj);
      showStep(2);
    } catch (err) {
      setAlert(
        err instanceof Error ? err.message : "Registration failed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function uploadPicked(
    file: File | null,
    docType: "LOGO" | "PROFILE_PIC",
  ): Promise<string | undefined> {
    if (!file || !account?.uploadToken) return undefined;
    const uploaded = await uploadDocument(
      {
        base64DataUrl: await fileToBase64DataUrl(file),
        coachCode: account.coachCode,
        refCode: account.coachCode,
        refType: "COACH",
        docType,
        savedBy: account.coachId,
      },
      account.uploadToken,
    );
    return uploaded.url;
  }

  async function completeRegistration() {
    if (busy) return;
    if (!agreed) {
      setAlert(
        "Please agree to the Terms of Service and Privacy Policy to continue.",
      );
      setTermsShake(true);
      window.setTimeout(() => setTermsShake(false), 600);
      return;
    }
    if (!account?.uploadToken) {
      setAlert("Please complete step 1 first.");
      setStep(1);
      return;
    }
    setAlert("");
    setBusy(true);
    const problems: string[] = [];
    try {
      let logoUrl: string | undefined;
      let photoUrl: string | undefined;
      try {
        logoUrl = await uploadPicked(logoFile, "LOGO");
        photoUrl = await uploadPicked(photoFile, "PROFILE_PIC");
      } catch {
        problems.push("your photos");
      }
      const toNumber = (value: string) =>
        value.trim() === "" ? undefined : Math.max(0, Number(value) || 0);
      const serviceCodes = services
        .filter((service) => selectedServices.includes(service.label))
        .map((service) => service.code);
      const saved = await saveRegisteredCoachDetails(
        {
          coachId: account.coachId,
          businessName: businessName.trim() || undefined,
          serviceCodes,
          experienceYears: toNumber(experience),
          happyClientCount: toNumber(clients),
          locality: locality.trim() || undefined,
          add_Line: address.trim() || undefined,
          city_Cd: city.trim() || undefined,
          state_Cd: stateName.trim() || undefined,
          pinCode: pin.trim() || undefined,
          country_Cd: country || undefined,
          coachDesc: description.trim() || undefined,
          logo_Url: logoUrl,
          profile_Pic_Url: photoUrl,
        },
        account.uploadToken,
      ).catch(() => null);
      if (!saved || !isApiSuccess(saved)) problems.push("your profile details");
    } finally {
      setBusy(false);
    }
    setFollowUp(
      problems.length ?
        `We could not save ${problems.join(" and ")}. Sign in and finish them from your profile.`
      : "",
    );
    setStep(5);
  }

  function openCropper(file: File | undefined, target: "logo" | "photo") {
    if (!file) return;
    const invalid = validateRegisterImage(file);
    if (invalid) {
      setAlert(invalid.message);
      return;
    }
    setCrop({
      target,
      file,
      url: URL.createObjectURL(file),
      title: target === "logo" ? "Crop Business Logo" : "Crop Profile Photo",
      hint:
        target === "logo" ?
          "Drag to position · Output: 400 × 200 px (2:1 landscape)"
        : "Drag to position · Output: 400 × 400 px (1:1 square)",
    });
  }

  function closeCropper() {
    if (
      crop?.url.startsWith("blob:") &&
      crop.url !== logoPreview &&
      crop.url !== photoPreview
    ) {
      URL.revokeObjectURL(crop.url);
    }
    setCrop(null);
  }

  function applyCrop() {
    if (!crop) return;
    if (crop.target === "logo") {
      setLogoPreview(crop.url);
      setLogoFile(crop.file);
    } else {
      setPhotoPreview(crop.url);
      setPhotoFile(crop.file);
    }
    setCrop(null);
  }

  async function lookupPin(value: string) {
    setPin(value);
    if (value.trim().length < 4) return;
    setPinLoading(true);
    try {
      const location = await fetchLocationByPin({
        pinCode: value.trim(),
        countryCode: country || "IN",
      });
      if (!location) return;
      if (location.city) setCity(location.city);
      if (location.state) setStateName(location.state);
    } catch {
      // Leave city and state as entered.
    } finally {
      setPinLoading(false);
    }
  }

  const serviceLabel =
    selectedServices.length > 0 ? selectedServices.join(", ")
    : category ? "-- Select services --"
    : "-- Select category first --";
  const stepClass = (number: number) =>
    step === number ? "rg-step rg-step-active"
    : step > number ? "rg-step rg-step-complete"
    : "rg-step";

  return {
    categories,
    step,
    setStep,
    alert,
    setAlert,
    invalid,
    setInvalid,
    termsShake,
    setTermsShake,
    name,
    setName,
    category,
    setCategory,
    mobile,
    setMobile,
    email,
    setEmail,
    referrerMobile,
    setReferrerMobile,
    services,
    setServices,
    servicesOpen,
    setServicesOpen,
    selectedServices,
    setSelectedServices,
    businessName,
    setBusinessName,
    experience,
    setExperience,
    clients,
    setClients,
    altMobile,
    setAltMobile,
    countries,
    setCountries,
    country,
    setCountry,
    pin,
    setPin,
    pinLoading,
    setPinLoading,
    locality,
    setLocality,
    city,
    setCity,
    stateName,
    setStateName,
    address,
    setAddress,
    description,
    setDescription,
    agreed,
    setAgreed,
    logoPreview,
    setLogoPreview,
    photoPreview,
    setPhotoPreview,
    logoFile,
    setLogoFile,
    photoFile,
    setPhotoFile,
    account,
    setAccount,
    busy,
    setBusy,
    followUp,
    setFollowUp,
    crop,
    setCrop,
    fieldClass,
    clearInvalid,
    validateStep,
    showStep,
    continueFromStep1,
    uploadPicked,
    completeRegistration,
    openCropper,
    closeCropper,
    applyCrop,
    lookupPin,
    serviceLabel,
    stepClass,
  };
}

export type RegisterFormController = ReturnType<typeof useRegisterForm>;
