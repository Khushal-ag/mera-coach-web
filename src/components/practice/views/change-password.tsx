"use client";

import { useState } from "react";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { PracticePageHeader } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { changeCoachPassword } from "@/lib/api/practice";

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
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      await changeCoachPassword({ currentPassword, newPassword });
      setMessage("Password updated.");
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
    <div className="mx-auto max-w-lg">
      <nav className="mb-4">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Profile
        </Link>
      </nav>
      <PracticePageHeader
        title="Change password"
        description="Update the password for your coach login."
      />
      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {message ?
        <AlertBanner tone="success">{message}</AlertBanner>
      : null}
      <form
        className="mc-panel mt-4 space-y-4 p-5"
        onSubmit={(e) => void onSubmit(e)}
      >
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="submit"
          className="mc-btn-primary w-full"
          disabled={busy || !currentPassword || !newPassword || !confirm}
          aria-busy={busy}
        >
          {busy ? "Updating password" : "Update password"}
        </button>
      </form>
    </div>
  );
}
