"use client";

import type { RegisterFormController } from "./use-register-form";

import { cn } from "@/lib/utils";

export function RegisterIntroStep({ form }: { form: RegisterFormController }) {
  const { step, showStep } = form;
  return (
    <div
      className={cn("rg-panel rg-intro", step === 0 ? "" : "rg-hidden")}
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
          Registration takes about <strong>3 minutes</strong>. Read the quick
          guide below so you have everything ready.
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
            <span>Service, business name, experience and client count.</span>
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
            <span>Photo, logo and a brief description to stand out.</span>
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
                <span className="rg-ii-tag rg-ii-req">Step 1: Required</span>
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
                <span className="rg-ii-tag rg-ii-req">Step 1: Required</span>
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
                <span className="rg-ii-tag rg-ii-opt">Step 2: Optional</span>
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
                <span className="rg-ii-tag rg-ii-opt">Step 4: Optional</span>
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
          <i className="fas fa-rocket" /> Start Registration: Takes 3 Minutes
          <i className="fas fa-arrow-right rg-btn-arr" />
        </button>
        <p className="rg-intro-cta-note">
          <i className="fas fa-lock" /> Your data is 100% secure and never
          shared with third parties.
        </p>
      </div>
    </div>
  );
}
