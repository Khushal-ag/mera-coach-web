"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { ServiceMultiSelect } from "@/components/practice/service-multi-select";
import { cn } from "@/lib/utils";

export function ProfileEditStep2({ editor }: { editor: ProfileEditor }) {
  const {
    busy,
    editStep,
    setEditStep,
    servicesLoading,
    businessName,
    setBusinessName,
    tagline,
    setTagline,
    coachTypeCode,
    serviceCodes,
    setServiceCodes,
    localLanguage,
    setLocalLanguage,
    recheckupDays,
    setRecheckupDays,
    experienceYears,
    setExperienceYears,
    happyClients,
    setHappyClients,
    certifications,
    setCertifications,
    visibleServiceOptions,
  } = editor;
  return (
    <div className={cn("rg-panel", editStep === 2 ? "" : "rg-hidden")}>
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-gold">
          <i className="fas fa-briefcase" />
        </div>
        <div>
          <h2>Professional details</h2>
          <p>Fields marked * are needed to appear on Find a Coach</p>
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
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} />
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
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-calendar-check" /> Assessment period (days)
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          <input
            value={recheckupDays}
            onChange={(e) => setRecheckupDays(e.target.value)}
            type="number"
            min={1}
            max={365}
          />
          <small>
            Days after an assessment when a client is due for the next one.
          </small>
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
          Next: Contact & Location <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
