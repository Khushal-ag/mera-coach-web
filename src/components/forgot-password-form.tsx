"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
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
      <form className="space-y-5" onSubmit={(e) => void onConfirm(e)}>
        {info ?
          <AlertBanner tone="success">{info}</AlertBanner>
        : null}
        {error ?
          <AlertBanner tone="error">{error}</AlertBanner>
        : null}
        <TextField
          label="Reset code"
          autoComplete="one-time-code"
          required
          tone="dark"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={busy}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          tone="dark"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={busy}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          tone="dark"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy}
          className="mc-btn-primary mt-1 w-full"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
        <button
          type="button"
          className="w-full text-sm font-semibold text-white/75 underline-offset-2 hover:underline"
          disabled={busy}
          onClick={() => {
            setError(null);
            setInfo(null);
            setStep("request");
          }}
        >
          Back to email / mobile
        </button>
        <p className="border-t border-white/10 pt-5 text-center text-sm text-white/70">
          <Link
            href="/coach-login"
            className="font-semibold text-[color:var(--mc-brand-coach)] transition-colors hover:brightness-110"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form className="space-y-5" onSubmit={(e) => void onRequest(e)}>
      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      <TextField
        label="Email or mobile"
        required
        autoComplete="username"
        tone="dark"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        disabled={busy}
      />
      <button
        type="submit"
        disabled={busy}
        className="mc-btn-primary mt-1 w-full"
      >
        {busy ? "Sending…" : "Send reset code"}
      </button>
      <p className="border-t border-white/10 pt-5 text-center text-sm text-white/70">
        <Link
          href="/coach-login"
          className="font-semibold text-[color:var(--mc-brand-coach)] transition-colors hover:brightness-110"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
