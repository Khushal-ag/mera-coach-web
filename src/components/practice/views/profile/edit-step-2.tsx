"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { ServiceMultiSelect } from "@/components/practice/service-multi-select";
import { MenuSelect } from "@/components/ui/menu-select";
import { LOCAL_LANGUAGE_OPTIONS } from "@/constants/local-languages";
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
    brandCode,
    setBrandCode,
    productBrands,
    profile,
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
  const savedBrandCode = profile?.brandCode?.trim() ?? "";
  const brandLocked = savedBrandCode.length > 0;
  const brandLabel =
    productBrands.find((brand) => brand.code === savedBrandCode)?.label ??
    savedBrandCode;
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
          <label htmlFor="peProductBrand">
            <i className="fas fa-tags" /> Product brand
            <span className="rg-req" aria-hidden>
              *
            </span>
          </label>
          {brandLocked ?
            <p className="ui-select border-border bg-muted/40 text-foreground flex min-h-11 items-center rounded-md border px-3.5 py-2 text-base">
              {brandLabel}
            </p>
          : <MenuSelect
              id="peProductBrand"
              skin="public"
              className="ui-select"
              value={brandCode}
              placeholder="Select brand"
              options={[
                { value: "", label: "Select brand" },
                ...productBrands.map((brand) => ({
                  value: brand.code,
                  label: brand.label,
                })),
              ]}
              onChange={(event) => setBrandCode(event.target.value)}
            />
          }
          <small>
            Used for your product packages. Package pages use this brand
            automatically. Brand is fixed after you save it once.
          </small>
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
          <label htmlFor="peLanguage">
            <i className="fas fa-language" /> Local language
          </label>
          <MenuSelect
            id="peLanguage"
            skin="public"
            className="ui-select"
            value={localLanguage}
            placeholder="Select language"
            options={[
              { value: "", label: "Select language" },
              ...LOCAL_LANGUAGE_OPTIONS.map((item) => ({
                value: item.code,
                label: item.label,
              })),
            ]}
            onChange={(event) => setLocalLanguage(event.target.value)}
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
            Clients past this period show as due on your checkup list.
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
