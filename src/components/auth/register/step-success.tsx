"use client";

import type { RegisterFormController } from "./use-register-form";

import { cn } from "@/lib/utils";

export function RegisterSuccessStep({
  form,
}: {
  form: RegisterFormController;
}) {
  const { step, email, followUp } = form;
  return (
    <div
      className={cn("rg-panel", step === 5 ? "" : "rg-hidden")}
      id="rgSuccess"
    >
      <div className="rg-success">
        <div className="rg-success-icon">
          <i className="fas fa-check-circle" />
        </div>
        <h2>Registration Successful!</h2>
        <p>
          Welcome to Mera Coach. We have emailed your login password to{" "}
          <strong>{email}</strong>. Your public profile goes live once our team
          has reviewed it.
        </p>
        {followUp ?
          <p className="rg-field-note">{followUp}</p>
        : null}
        <div className="rg-success-btns">
          <a href="/coach-login" className="btn rg-btn-next">
            <i className="fas fa-sign-in-alt" /> Sign In
          </a>
          <a href="/" className="btn rg-btn-back">
            <i className="fas fa-home" /> Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
