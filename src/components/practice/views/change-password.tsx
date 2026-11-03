"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { PracticePageHeader } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { changeCoachPassword } from "@/lib/api/practice";
import { PASSWORD_RULE, passwordPolicyError } from "@/lib/password";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div className="cp-field">
      <label htmlFor={id}>
        {label} <span aria-hidden>*</span>
      </label>
      <div className="cp-input">
        <input
          id={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={shown}
        >
          <i
            className={shown ? "fas fa-eye-slash" : "fas fa-eye"}
            aria-hidden
          />
        </button>
      </div>
      {error || hint ?
        <p id={`${id}-note`} className={error ? "cp-note cp-error" : "cp-note"}>
          {error ?? hint}
        </p>
      : null}
    </div>
  );
}

export function ChangePasswordView() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const passwordError = passwordPolicyError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await changeCoachPassword({ currentPassword, newPassword });
      setMessage("Password updated successfully.");
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not change password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cl-form-page cp-page min-w-0">
      <PracticePageHeader
        title="Change password"
        back={{ href: "/dashboard/profile", label: "Back to profile" }}
        description="Update the password for your coach login."
        icon={<i className="fas fa-key" style={{ fontSize: 20 }} aria-hidden />}
      />
      <div className="cp-alerts">
        {error ?
          <AlertBanner tone="error">{error}</AlertBanner>
        : null}
        {message ?
          <AlertBanner tone="success">{message}</AlertBanner>
        : null}
      </div>
      <div className="cp-layout">
        <form
          className="ac-card cp-card"
          onSubmit={(e) => void onSubmit(e)}
          noValidate
        >
          <h5 className="ac-card-title">
            <i className="fas fa-key" /> Update Password
          </h5>
          <div className="cp-body">
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrent}
            />
            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNew}
              hint={PASSWORD_RULE}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
              error={
                confirm && newPassword !== confirm ?
                  "Passwords do not match."
                : undefined
              }
            />
            <div className="cp-actions">
              <button
                type="submit"
                className="mc-btn-primary"
                disabled={busy || !currentPassword || !newPassword || !confirm}
                aria-busy={busy}
              >
                {busy ? "Updating password" : "Update password"}
              </button>
              <Link href="/dashboard/profile" className="mc-btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
        <aside className="ac-card cp-tips" aria-label="Password tips">
          <h5 className="ac-card-title">
            <i className="fas fa-shield-alt" /> Keep your account safe
          </h5>
          <ul className="cp-tips-list">
            <li>Pick a password you do not use anywhere else.</li>
            <li>Do not include your name or mobile number.</li>
            <li>
              Forgot your current password? Sign out, then use{" "}
              <b>Forgot password</b> on the sign-in page.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
