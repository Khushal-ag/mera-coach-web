"use client";

import type { RegisterFormController } from "./use-register-form";

import { MenuSelect } from "@/components/ui/menu-select";
import { cn } from "@/lib/utils";

export function RegisterAccountStep({
  form,
}: {
  form: RegisterFormController;
}) {
  const {
    categories,
    step,
    invalid,
    name,
    setName,
    category,
    setCategory,
    mobile,
    setMobile,
    email,
    setEmail,
    fieldClass,
    clearInvalid,
    continueFromStep1,
  } = form;
  return (
    <div
      className={cn("rg-panel", step === 1 ? "" : "rg-hidden")}
      id="rgPanel1"
    >
      <div className="rg-section-head">
        <div className="rg-sh-icon rg-sh-green">
          <i className="fas fa-user-check" />
        </div>
        <div>
          <h2>Create Your Account</h2>
          <p>Just 4 fields, your account is ready instantly</p>
        </div>
        <span className="rg-required-note">* Required</span>
      </div>
      <div className="rg-info-note">
        <i className="fas fa-envelope-open-text" />
        <div>
          <strong>We&apos;ll email your login password.</strong> Once
          registered, you can complete the remaining profile details after
          logging in.
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
            <i className="fas fa-info-circle" /> Password will be sent to this
            email
          </span>
        </div>
      </div>
      <div className="rg-nav rg-nav-right">
        <button
          type="button"
          className="btn rg-btn-register"
          id="rgRegisterBtn"
          onClick={() => void continueFromStep1()}
        >
          <i className="fas fa-user-plus" /> Register Now & Continue{" "}
          <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
