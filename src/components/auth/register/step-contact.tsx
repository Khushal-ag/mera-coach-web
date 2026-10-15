"use client";

import type { RegisterFormController } from "./use-register-form";

import { MenuSelect } from "@/components/ui/menu-select";
import { cn } from "@/lib/utils";

export function RegisterContactStep({
  form,
}: {
  form: RegisterFormController;
}) {
  const {
    countries,
    step,
    altMobile,
    setAltMobile,
    country,
    setCountry,
    pin,
    setPin,
    pinLoading,
    locality,
    setLocality,
    city,
    setCity,
    stateName,
    setStateName,
    address,
    setAddress,
    showStep,
    lookupPin,
  } = form;
  return (
    <div
      className={cn("rg-panel", step === 3 ? "" : "rg-hidden")}
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
              className={cn("rg-pin-loader", pinLoading ? "" : "rg-hidden")}
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
          Next: Profile & Media <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
