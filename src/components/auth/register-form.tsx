"use client";

import { useEffect, useState } from "react";

import type { MasterOption } from "@/lib/api/master";

import { MenuSelect } from "@/components/ui/menu-select";
import {
  fetchLocationByPin,
  fetchMasterOptions,
  fetchServicesForCategory,
} from "@/lib/api/master";

const EXPERIENCE = [
  { value: "0", label: "Less than 1 year" },
  ...Array.from({ length: 30 }, (_, index) => {
    const years = index + 1;
    return {
      value: String(years),
      label: `${years} year${years > 1 ? "s" : ""}`,
    };
  }),
  { value: "31", label: "30+ years" },
];

export function RegisterForm({ categories }: { categories: MasterOption[] }) {
  const [step, setStep] = useState(0);
  const [alert, setAlert] = useState("");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [termsShake, setTermsShake] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
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
  const [crop, setCrop] = useState<{
    target: "logo" | "photo";
    url: string;
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
        pattern: /^\d{10}$/,
        patternMsg: "Enter a valid 10-digit mobile number.",
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

  function continueFromStep1() {
    if (!validateStep()) return;
    showStep(2);
  }

  function completeRegistration() {
    if (!agreed) {
      setAlert(
        "Please agree to the Terms of Service and Privacy Policy to continue.",
      );
      setTermsShake(true);
      window.setTimeout(() => setTermsShake(false), 600);
      return;
    }
    setAlert("");
    setStep(5);
  }

  function openCropper(file: File | undefined, target: "logo" | "photo") {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setAlert("File size must be under 10 MB.");
      return;
    }
    setCrop({
      target,
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
    if (crop.target === "logo") setLogoPreview(crop.url);
    else setPhotoPreview(crop.url);
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

  return (
    <div className="mc-public">
      <div className="rg-page">
        <div className="rg-card">
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
                <h1>Register as a Coach</h1>
                <p>
                  Join 500+ verified coaches on India&apos;s leading wellness
                  platform
                </p>
              </div>
            </div>
            <div
              className="rg-steps"
              id="rgSteps"
              style={{ display: step >= 1 && step < 5 ? "flex" : "none" }}
            >
              <div className={stepClass(1)} id="rgs-1">
                <div className="rg-step-circle">
                  <span className="rg-step-num">1</span>
                  <i className="fas fa-check rg-step-done" />
                </div>
                <span>Register</span>
              </div>
              <div className="rg-step-line" />
              <div className={stepClass(2)} id="rgs-2">
                <div className="rg-step-circle">
                  <span className="rg-step-num">2</span>
                  <i className="fas fa-check rg-step-done" />
                </div>
                <span>Coach Details</span>
              </div>
              <div className="rg-step-line" />
              <div className={stepClass(3)} id="rgs-3">
                <div className="rg-step-circle">
                  <span className="rg-step-num">3</span>
                  <i className="fas fa-check rg-step-done" />
                </div>
                <span>Contact</span>
              </div>
              <div className="rg-step-line" />
              <div className={stepClass(4)} id="rgs-4">
                <div className="rg-step-circle">
                  <span className="rg-step-num">4</span>
                  <i className="fas fa-check rg-step-done" />
                </div>
                <span>Profile</span>
              </div>
            </div>
          </div>

          <div className="rg-card-body">
            <div className={`rg-alert${alert ? "" : "rg-hidden"}`} id="rgAlert">
              <i className="fas fa-exclamation-circle" />
              <span id="rgAlertMsg">
                {alert || "Please fill all required fields."}
              </span>
            </div>

            <div
              className={`rg-panel rg-intro${step === 0 ? "" : "rg-hidden"}`}
              id="rgPanelIntro"
            >
              <div className="rg-intro-head">
                <div className="rg-intro-badge">
                  <i className="fas fa-info-circle" /> Before You Begin
                </div>
                <h2>
                  Everything You Need
                  <br />
                  to Know Before Registering
                </h2>
                <p>
                  Registration takes about <strong>3 minutes</strong>. Read the
                  quick guide below so you have everything ready.
                </p>
              </div>
              <div className="rg-intro-how">
                <div className="rg-intro-how-title">
                  <i className="fas fa-route" /> How Registration Works
                </div>
                <div className="rg-intro-steps">
                  <div className="rg-is">
                    <div className="rg-is-num">01</div>
                    <div className="rg-is-icon rg-is-green">
                      <i className="fas fa-user-check" />
                    </div>
                    <strong>Quick Register</strong>
                    <span>
                      Name, mobile, email & category. Account created instantly.
                    </span>
                  </div>
                  <div className="rg-is">
                    <div className="rg-is-num">02</div>
                    <div className="rg-is-icon rg-is-gold">
                      <i className="fas fa-user-tie" />
                    </div>
                    <strong>Coach Details</strong>
                    <span>
                      Service, business name, experience and client count.
                    </span>
                  </div>
                  <div className="rg-is">
                    <div className="rg-is-num">03</div>
                    <div className="rg-is-icon rg-is-green">
                      <i className="fas fa-map-marker-alt" />
                    </div>
                    <strong>Contact & Location</strong>
                    <span>Alternate mobile, pin code, city and address.</span>
                  </div>
                  <div className="rg-is">
                    <div className="rg-is-num">04</div>
                    <div className="rg-is-icon rg-is-red">
                      <i className="fas fa-id-badge" />
                    </div>
                    <strong>Profile & Media</strong>
                    <span>
                      Photo, logo and a brief description to stand out.
                    </span>
                  </div>
                </div>
              </div>
              <div className="rg-intro-checklist">
                <div className="rg-intro-how-title">
                  <i className="fas fa-clipboard-check" /> Have These Ready
                </div>
                <div className="rg-intro-items">
                  <div className="rg-ii">
                    <div className="rg-ii-icon rg-ii-red">
                      <i className="fas fa-mobile-alt" />
                    </div>
                    <div className="rg-ii-body">
                      <strong>
                        Mobile Number{" "}
                        <span className="rg-ii-tag rg-ii-req">
                          Step 1 — Required
                        </span>
                      </strong>
                      <p>A valid 10-digit mobile number.</p>
                    </div>
                  </div>
                  <div className="rg-ii">
                    <div className="rg-ii-icon rg-ii-red">
                      <i className="fas fa-envelope" />
                    </div>
                    <div className="rg-ii-body">
                      <strong>
                        Email Address{" "}
                        <span className="rg-ii-tag rg-ii-req">
                          Step 1 — Required
                        </span>
                      </strong>
                      <p>Your login password will be sent here.</p>
                    </div>
                  </div>
                  <div className="rg-ii">
                    <div className="rg-ii-icon rg-ii-gold">
                      <i className="fas fa-building" />
                    </div>
                    <div className="rg-ii-body">
                      <strong>
                        Business Name{" "}
                        <span className="rg-ii-tag rg-ii-opt">
                          Step 2 — Optional
                        </span>
                      </strong>
                      <p>Your gym, studio or practice name.</p>
                    </div>
                  </div>
                  <div className="rg-ii">
                    <div className="rg-ii-icon rg-ii-green">
                      <i className="fas fa-image" />
                    </div>
                    <div className="rg-ii-body">
                      <strong>
                        Business Logo{" "}
                        <span className="rg-ii-tag rg-ii-opt">
                          Step 4 — Optional
                        </span>
                      </strong>
                      <p>Your studio or brand logo.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rg-intro-cta">
                <button
                  type="button"
                  className="btn rg-btn-start"
                  onClick={() => showStep(1)}
                >
                  <i className="fas fa-rocket" /> Start Registration — Takes 3
                  Minutes
                  <i className="fas fa-arrow-right rg-btn-arr" />
                </button>
                <p className="rg-intro-cta-note">
                  <i className="fas fa-lock" /> Your data is 100% secure and
                  never shared with third parties.
                </p>
              </div>
            </div>

            <div
              className={`rg-panel${step === 1 ? "" : "rg-hidden"}`}
              id="rgPanel1"
            >
              <div className="rg-section-head">
                <div className="rg-sh-icon rg-sh-green">
                  <i className="fas fa-user-check" />
                </div>
                <div>
                  <h2>Create Your Account</h2>
                  <p>Just 4 fields — your account is ready instantly</p>
                </div>
                <span className="rg-required-note">* Required</span>
              </div>
              <div className="rg-info-note">
                <i className="fas fa-envelope-open-text" />
                <div>
                  <strong>We&apos;ll email your login password.</strong> Once
                  registered, you can complete the remaining profile details
                  after logging in.
                </div>
              </div>
              <div className="rg-grid">
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgCoachName">
                    <i className="fas fa-user" /> Coach Name{" "}
                    <span className="rg-req">*</span>
                  </label>
                  <input
                    id="rgCoachName"
                    className={fieldClass("rgCoachName")}
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearInvalid("rgCoachName");
                    }}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgCategory">
                    <i className="fas fa-layer-group" /> Coach Category{" "}
                    <span className="rg-req">*</span>
                  </label>
                  <MenuSelect
                    id="rgCategory"
                    skin="public"
                    className="ui-select"
                    value={category}
                    placeholder="-- Select a category --"
                    invalid={invalid === "rgCategory"}
                    options={[
                      { value: "", label: "-- Select a category --" },
                      ...categories.map((item) => ({
                        value: item.code,
                        label: item.label,
                      })),
                    ]}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      clearInvalid("rgCategory");
                    }}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgMobile">
                    <i className="fas fa-mobile-alt" /> Mobile Number{" "}
                    <span className="rg-req">*</span>
                  </label>
                  <input
                    id="rgMobile"
                    className={fieldClass("rgMobile")}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) => {
                      setMobile(event.target.value);
                      clearInvalid("rgMobile");
                    }}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgEmail">
                    <i className="fas fa-envelope" /> Email Address{" "}
                    <span className="rg-req">*</span>
                  </label>
                  <input
                    id="rgEmail"
                    className={fieldClass("rgEmail")}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearInvalid("rgEmail");
                    }}
                  />
                  <span className="rg-field-note">
                    <i className="fas fa-info-circle" /> Password will be sent
                    to this email
                  </span>
                </div>
              </div>
              <div className="rg-nav rg-nav-right">
                <button
                  type="button"
                  className="btn rg-btn-register"
                  id="rgRegisterBtn"
                  onClick={continueFromStep1}
                >
                  <i className="fas fa-user-plus" /> Register Now & Continue{" "}
                  <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>

            <div
              className={`rg-panel${step === 2 ? "" : "rg-hidden"}`}
              id="rgPanel2"
            >
              <div className="rg-section-head">
                <div className="rg-sh-icon rg-sh-gold">
                  <i className="fas fa-user-tie" />
                </div>
                <div>
                  <h2>Coach Details</h2>
                  <p>Your expertise, services and experience</p>
                </div>
                <span className="rg-optional-note">All optional</span>
              </div>
              <div className="rg-skip-note">
                <i className="fas fa-check-circle" />
                <span>
                  These details are optional. You can complete them now or after
                  you log in.
                </span>
              </div>
              <div className="rg-grid">
                <div className="rg-field rg-col-2">
                  <label>
                    <i className="fas fa-tag" /> Service / Specialisation
                  </label>
                  <div
                    className={`rg-multiselect${servicesOpen ? "rg-ms-open" : ""}`}
                    id="rgServiceWrap"
                  >
                    <div
                      className="rg-multiselect-trigger"
                      role="button"
                      tabIndex={0}
                      onClick={() => setServicesOpen((open) => !open)}
                    >
                      <span>{serviceLabel}</span>
                      <i className="fas fa-chevron-down" />
                    </div>
                    <div
                      className={`rg-multiselect-panel${servicesOpen ? "" : "rg-hidden"}`}
                    >
                      {services.length === 0 ?
                        <p className="rg-field-note">
                          No services returned for this category.
                        </p>
                      : services.map((service) => (
                          <label key={service.code}>
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.label)}
                              onChange={() => {
                                setSelectedServices((current) =>
                                  current.includes(service.label) ?
                                    current.filter(
                                      (item) => item !== service.label,
                                    )
                                  : [...current, service.label],
                                );
                              }}
                            />
                            {service.label}
                          </label>
                        ))
                      }
                    </div>
                  </div>
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgBizName">
                    <i className="fas fa-building" /> Business Name
                  </label>
                  <input
                    id="rgBizName"
                    placeholder="Academy / studio / clinic name"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgExp">
                    <i className="fas fa-briefcase" /> Experience (Years)
                  </label>
                  <MenuSelect
                    id="rgExp"
                    skin="public"
                    className="ui-select"
                    value={experience}
                    placeholder="-- Select --"
                    options={[
                      { value: "", label: "-- Select --" },
                      ...EXPERIENCE.map((item) => ({
                        value: item.value,
                        label: item.label,
                      })),
                    ]}
                    onChange={(event) => setExperience(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgClients">
                    <i className="fas fa-smile" /> Happy Customers
                  </label>
                  <input
                    id="rgClients"
                    type="number"
                    placeholder="e.g. 120"
                    min={0}
                    max={1000}
                    value={clients}
                    onChange={(event) => setClients(event.target.value)}
                  />
                </div>
              </div>
              <div className="rg-nav">
                <button
                  type="button"
                  className="btn rg-btn-back"
                  onClick={() => showStep(1)}
                >
                  <i className="fas fa-arrow-left" /> Back
                </button>
                <button
                  type="button"
                  className="btn rg-btn-next"
                  onClick={() => showStep(3)}
                >
                  Next — Contact Details <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>

            <div
              className={`rg-panel${step === 3 ? "" : "rg-hidden"}`}
              id="rgPanel3"
            >
              <div className="rg-section-head">
                <div className="rg-sh-icon rg-sh-green">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <div>
                  <h2>Contact & Location</h2>
                  <p>Help local clients find you on the platform</p>
                </div>
                <span className="rg-optional-note">All optional</span>
              </div>
              <div className="rg-grid">
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgAltMobile">
                    <i className="fas fa-phone" /> Alternate Mobile
                  </label>
                  <input
                    id="rgAltMobile"
                    type="tel"
                    placeholder="Secondary contact number"
                    maxLength={10}
                    value={altMobile}
                    onChange={(event) => setAltMobile(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgCountry">
                    <i className="fas fa-globe" /> Country
                  </label>
                  <MenuSelect
                    id="rgCountry"
                    skin="public"
                    className="ui-select"
                    value={country}
                    placeholder="-- Select Country --"
                    options={[
                      { value: "", label: "-- Select Country --" },
                      ...countries.map((item) => ({
                        value: item.code,
                        label: item.label,
                      })),
                    ]}
                    onChange={(event) => {
                      setCountry(event.target.value);
                      setCity("");
                      setStateName("");
                      setPin("");
                    }}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgPin">
                    <i className="fas fa-map-pin" /> Pin Code
                  </label>
                  <div className="rg-pin-wrap">
                    <input
                      id="rgPin"
                      placeholder="e.g. 110001"
                      maxLength={10}
                      value={pin}
                      onChange={(event) => void lookupPin(event.target.value)}
                    />
                    <span
                      className={`rg-pin-loader${pinLoading ? "" : "rg-hidden"}`}
                    >
                      <i className="fas fa-spinner fa-spin" />
                    </span>
                  </div>
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgLocation">
                    <i className="fas fa-map-marker-alt" /> Location / Area
                  </label>
                  <input
                    id="rgLocation"
                    placeholder="e.g. Connaught Place"
                    value={locality}
                    onChange={(event) => setLocality(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgCity">
                    <i className="fas fa-city" /> City
                  </label>
                  <input
                    id="rgCity"
                    placeholder="Auto-filled from Pin Code"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-2">
                  <label htmlFor="rgState">
                    <i className="fas fa-map" /> State
                  </label>
                  <input
                    id="rgState"
                    placeholder="Auto-filled from Pin Code"
                    value={stateName}
                    onChange={(event) => setStateName(event.target.value)}
                  />
                </div>
                <div className="rg-field rg-col-full">
                  <label htmlFor="rgAddress">
                    <i className="fas fa-home" /> Full Address
                  </label>
                  <input
                    id="rgAddress"
                    placeholder="Building, Street, Locality"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </div>
              <div className="rg-nav">
                <button
                  type="button"
                  className="btn rg-btn-back"
                  onClick={() => showStep(2)}
                >
                  <i className="fas fa-arrow-left" /> Back
                </button>
                <button
                  type="button"
                  className="btn rg-btn-next"
                  onClick={() => showStep(4)}
                >
                  Next — Profile & Media <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>

            <div
              className={`rg-panel${step === 4 ? "" : "rg-hidden"}`}
              id="rgPanel4"
            >
              <div className="rg-section-head">
                <div className="rg-sh-icon rg-sh-red">
                  <i className="fas fa-id-badge" />
                </div>
                <div>
                  <h2>Media & Profile</h2>
                  <p>Photos and a description make your profile stand out</p>
                </div>
                <span className="rg-optional-note">
                  All optional — but recommended
                </span>
              </div>
              <div className="rg-grid">
                <div className="rg-field rg-col-2">
                  <label>
                    <i className="fas fa-image" /> Business Logo
                  </label>
                  <div
                    className="rg-upload"
                    onClick={() =>
                      document.getElementById("rgLogoFile")?.click()
                    }
                  >
                    <input
                      type="file"
                      id="rgLogoFile"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        openCropper(event.target.files?.[0], "logo");
                        event.target.value = "";
                      }}
                    />
                    <div className="rg-upload-placeholder" id="rgLogoPreview">
                      {logoPreview ?
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="rg-img-preview"
                        />
                      : <>
                          <i className="fas fa-cloud-upload-alt" />
                          <strong>Click to upload logo</strong>
                          <span>2:1 landscape • PNG/JPG • Max 10 MB</span>
                        </>
                      }
                    </div>
                  </div>
                  <span className="rg-field-note">
                    <i className="fas fa-info-circle" /> Will be cropped to 400
                    × 200 px (2:1)
                  </span>
                </div>
                <div className="rg-field rg-col-2">
                  <label>
                    <i className="fas fa-user-circle" /> Profile Photo{" "}
                    <span className="rg-rec">Recommended</span>
                  </label>
                  <div
                    className="rg-upload"
                    onClick={() =>
                      document.getElementById("rgPhotoFile")?.click()
                    }
                  >
                    <input
                      type="file"
                      id="rgPhotoFile"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(event) => {
                        openCropper(event.target.files?.[0], "photo");
                        event.target.value = "";
                      }}
                    />
                    <div className="rg-upload-placeholder" id="rgPhotoPreview">
                      {photoPreview ?
                        <img
                          src={photoPreview}
                          alt="Photo"
                          className="rg-img-preview"
                        />
                      : <>
                          <i className="fas fa-camera" />
                          <strong>Click to upload photo</strong>
                          <span>Square • PNG/JPG • Max 10 MB</span>
                        </>
                      }
                    </div>
                  </div>
                  <span className="rg-field-note">
                    <i className="fas fa-info-circle" /> Will be cropped to 400
                    × 400 px (1:1 square)
                  </span>
                </div>
                <div className="rg-field rg-col-full">
                  <label htmlFor="rgDesc">
                    <i className="fas fa-align-left" /> Brief Description{" "}
                    <span className="rg-rec">Recommended</span>
                  </label>
                  <textarea
                    id="rgDesc"
                    rows={4}
                    maxLength={500}
                    placeholder="Tell potential clients about your coaching style, certifications, achievements..."
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value.slice(0, 500))
                    }
                  />
                  <span className="rg-char-count">
                    <span id="rgDescCount">{description.length}</span> / 500
                  </span>
                </div>
                <div className="rg-field rg-col-full">
                  <label
                    className={`rg-check-label${termsShake ? "rg-shake" : ""}`}
                    id="rgTermsLabel"
                  >
                    <input
                      type="checkbox"
                      id="rgTerms"
                      checked={agreed}
                      onChange={(event) => setAgreed(event.target.checked)}
                    />
                    <span className="rg-checkbox" />I agree to the{" "}
                    <a href="/terms">Terms of Service</a> and{" "}
                    <a href="/privacy">Privacy Policy</a> of Mera Coach.
                  </label>
                </div>
              </div>
              <div className="rg-nav">
                <button
                  type="button"
                  className="btn rg-btn-back"
                  onClick={() => showStep(3)}
                >
                  <i className="fas fa-arrow-left" /> Back
                </button>
                <button
                  type="button"
                  className="btn rg-btn-submit"
                  onClick={completeRegistration}
                >
                  <i className="fas fa-paper-plane" /> Complete Registration
                </button>
              </div>
            </div>

            <div
              className={`rg-panel${step === 5 ? "" : "rg-hidden"}`}
              id="rgSuccess"
            >
              <div className="rg-success">
                <div className="rg-success-icon">
                  <i className="fas fa-check-circle" />
                </div>
                <h2>Registration Successful!</h2>
                <p>
                  Welcome to Mera Coach. Your profile is under review and will
                  go live within <strong>24 hours</strong>.
                </p>
                <div className="rg-success-btns">
                  <a href="/coach" className="btn rg-btn-next">
                    <i className="fas fa-eye" /> Preview Your Profile
                  </a>
                  <a href="/" className="btn rg-btn-back">
                    <i className="fas fa-home" /> Go to Home
                  </a>
                </div>
              </div>
            </div>
          </div>

          {crop ?
            <div
              id="rgCropModal"
              style={{
                display: "flex",
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.75)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  maxWidth: 560,
                  width: "95%",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1b4332",
                      }}
                    >
                      {crop.title}
                    </h3>
                    <p
                      style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}
                    >
                      {crop.hint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCropper}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      cursor: "pointer",
                      color: "#999",
                    }}
                  >
                    ×
                  </button>
                </div>
                <div
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    overflow: "hidden",
                    background: "#f0f0f0",
                    borderRadius: 10,
                  }}
                >
                  <img
                    src={crop.url}
                    alt=""
                    style={{ maxWidth: "100%", display: "block" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  <i
                    className="fas fa-search-minus"
                    style={{ color: "#888", fontSize: 13 }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={0}
                    style={{ flex: 1, accentColor: "#1b4332" }}
                  />
                  <i
                    className="fas fa-search-plus"
                    style={{ color: "#888", fontSize: 13 }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    marginTop: 18,
                  }}
                >
                  <button
                    type="button"
                    onClick={closeCropper}
                    style={{
                      padding: "9px 20px",
                      border: "1.5px solid #ddd",
                      borderRadius: 8,
                      background: "#fff",
                      fontSize: 13,
                      cursor: "pointer",
                      color: "#555",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCrop}
                    style={{
                      padding: "9px 24px",
                      border: "none",
                      borderRadius: 8,
                      background: "#1b4332",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <i className="fas fa-crop-alt" /> Apply Crop
                  </button>
                </div>
              </div>
            </div>
          : null}

          <div className="rg-card-foot">
            Already registered?{" "}
            <a href="/coach-login">
              Sign in to your account <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
