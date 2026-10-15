"use client";

import type { ProfileEditor } from "./use-profile-editor";

import { cn } from "@/lib/utils";

export function ProfileEditStep3({ editor }: { editor: ProfileEditor }) {
  const {
    editStep,
    setEditStep,
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
    pinLookup,
  } = editor;
  return (
    <div className={cn("rg-panel", editStep === 3 ? "" : "rg-hidden")}>
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
            <span className="rg-field-note">Looking up city…</span>
          : null}
          {pinLookup.error ?
            <span className="rg-field-note">{pinLookup.error}</span>
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
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-map" /> State
          </label>
          <input value={stateCd} onChange={(e) => setStateCd(e.target.value)} />
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
          <input value={addLine} onChange={(e) => setAddLine(e.target.value)} />
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
          Next: Profile & Media <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
