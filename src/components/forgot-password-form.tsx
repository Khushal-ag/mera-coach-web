"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { requestForgotPassword, resetCoachPassword } from "@/lib/api/practice";

type Step = "request" | "confirm";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [userName, setUserName] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = userName.trim();
    if (!trimmed) {
      setError("Enter your email or mobile.");
      return;
    }
    setBusy(true);
    try {
      await requestForgotPassword(trimmed);
      setStep("confirm");
      setInfo(
        "If that account has an email or SMS channel, we sent a reset code. Enter it below.",
      );
    } catch (err) {
      setError(
        err instanceof Error ?
          err.message
        : "Could not start password reset. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!token.trim()) {
      setError("Enter the reset code from your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetCoachPassword({ token, newPassword });
      router.replace("/coach-login");
    } catch (err) {
      setError(
        err instanceof Error ?
          err.message
        : "Password reset could not be completed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (step === "confirm") {
    return (
      <form className="lg-form" onSubmit={(e) => void onConfirm(e)}>
        {info ?
          <div className="rg-info-note">
            <i className="fas fa-check-circle" />
            <div>{info}</div>
          </div>
        : null}
        {error ?
          <div className="rg-alert">
            <i className="fas fa-exclamation-circle" />
            <span>{error}</span>
          </div>
        : null}
        <div className="lg-field">
          <label htmlFor="resetCode">
            <i className="fas fa-key" /> Reset code
          </label>
          <div className="lg-input-wrap">
            <input
              id="resetCode"
              autoComplete="one-time-code"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <div className="lg-field">
          <label htmlFor="newPassword">
            <i className="fas fa-lock" /> New password
          </label>
          <div className="lg-input-wrap">
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <div className="lg-field">
          <label htmlFor="confirmPassword">
            <i className="fas fa-lock" /> Confirm new password
          </label>
          <div className="lg-input-wrap">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <button type="submit" disabled={busy} className="lg-submit-btn">
          {busy ? "Updating password" : "Update password"}
        </button>
        <button
          type="button"
          className="btn rg-btn-back"
          disabled={busy}
          onClick={() => {
            setError(null);
            setInfo(null);
            setStep("request");
          }}
        >
          Back to email / mobile
        </button>
        <p className="lg-register-link">
          <Link href="/coach-login">Back to sign in</Link>
        </p>
      </form>
    );
  }

  return (
    <form className="lg-form" onSubmit={(e) => void onRequest(e)}>
      {error ?
        <div className="rg-alert">
          <i className="fas fa-exclamation-circle" />
          <span>{error}</span>
        </div>
      : null}
      <div className="lg-field">
        <label htmlFor="resetUser">
          <i className="fas fa-user" /> Email or mobile
        </label>
        <div className="lg-input-wrap">
          <input
            id="resetUser"
            autoComplete="username"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={busy}
          />
        </div>
      </div>
      <button type="submit" disabled={busy} className="lg-submit-btn">
        {busy ? "Sending code" : "Send reset code"}
      </button>
      <p className="lg-register-link">
        <Link href="/coach-login">Back to sign in</Link>
      </p>
    </form>
  );
}
