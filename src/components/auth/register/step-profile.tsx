"use client";

import type { RegisterFormController } from "./use-register-form";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function RegisterProfileStep({
  form,
}: {
  form: RegisterFormController;
}) {
  const {
    step,
    termsShake,
    description,
    setDescription,
    agreed,
    setAgreed,
    logoPreview,
    photoPreview,
    busy,
    showStep,
    completeRegistration,
    openCropper,
  } = form;
  return (
    <div
      className={cn("rg-panel", step === 4 ? "" : "rg-hidden")}
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
        <span className="rg-optional-note">All optional, but recommended</span>
      </div>
      <div className="rg-grid">
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-image" /> Business Logo
          </label>
          <div
            className="rg-upload"
            onClick={() => document.getElementById("rgLogoFile")?.click()}
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
                // Local blob preview cannot be optimized by next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" className="rg-img-preview" />
              : <>
                  <i className="fas fa-cloud-upload-alt" />
                  <strong>Click to upload logo</strong>
                  <span>2:1 landscape • PNG/JPG • Max 5 MB</span>
                </>
              }
            </div>
          </div>
          <span className="rg-field-note">
            <i className="fas fa-info-circle" /> Will be cropped to 400 × 200 px
            (2:1)
          </span>
        </div>
        <div className="rg-field rg-col-2">
          <label>
            <i className="fas fa-user-circle" /> Profile Photo{" "}
            <span className="rg-rec">Recommended</span>
          </label>
          <div
            className="rg-upload"
            onClick={() => document.getElementById("rgPhotoFile")?.click()}
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
                // Local blob preview cannot be optimized by next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Photo"
                  className="rg-img-preview"
                />
              : <>
                  <i className="fas fa-camera" />
                  <strong>Click to upload photo</strong>
                  <span>Square • PNG/JPG • Max 5 MB</span>
                </>
              }
            </div>
          </div>
          <span className="rg-field-note">
            <i className="fas fa-info-circle" /> Will be cropped to 400 × 400 px
            (1:1 square)
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
            className={cn("rg-check-label", termsShake ? "rg-shake" : "")}
            id="rgTermsLabel"
          >
            <input
              type="checkbox"
              id="rgTerms"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span className="rg-checkbox" />I agree to the{" "}
            <a href={siteConfig.links.terms}>Terms of Service</a> and{" "}
            <a href={siteConfig.links.privacy}>Privacy Policy</a> of Mera Coach.
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
          disabled={busy}
          aria-busy={busy}
          onClick={() => void completeRegistration()}
        >
          <i className="fas fa-paper-plane" /> Complete Registration
        </button>
      </div>
    </div>
  );
}
