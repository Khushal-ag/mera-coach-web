"use client";

import type { MasterOption } from "@/lib/api/master";

import { siteConfig } from "@/config/site";
import { COACH_COUNT_TEXT } from "@/constants/home";
import { cn } from "@/lib/utils";

import { CropDialog } from "./register/crop-dialog";
import { RegisterAccountStep } from "./register/step-account";
import { RegisterContactStep } from "./register/step-contact";
import { RegisterDetailsStep } from "./register/step-details";
import { RegisterIntroStep } from "./register/step-intro";
import { RegisterProfileStep } from "./register/step-profile";
import { RegisterSuccessStep } from "./register/step-success";
import { useRegisterForm } from "./register/use-register-form";

export function RegisterForm({ categories }: { categories: MasterOption[] }) {
  const form = useRegisterForm(categories);
  const { step, alert, stepClass } = form;

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
                  Join {COACH_COUNT_TEXT} verified coaches on India&apos;s
                  leading wellness platform
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
            <div
              className={cn("rg-alert", alert ? "" : "rg-hidden")}
              id="rgAlert"
            >
              <i className="fas fa-exclamation-circle" />
              <span id="rgAlertMsg">
                {alert || "Please fill all required fields."}
              </span>
            </div>

            <RegisterIntroStep form={form} />
            <RegisterAccountStep form={form} />
            <RegisterDetailsStep form={form} />
            <RegisterContactStep form={form} />
            <RegisterProfileStep form={form} />
            <RegisterSuccessStep form={form} />
          </div>

          <CropDialog form={form} />

          <div className="rg-card-foot">
            Already registered?{" "}
            <a href={siteConfig.links.coachLogin}>
              Sign in to your account <i className="fas fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
