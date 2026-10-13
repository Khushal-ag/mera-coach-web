"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { loginCoach } from "@/lib/api/auth";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function CoachLoginForm() {
  const { session, ready, setSession, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !session) return;
    router.replace(nextPath);
  }, [ready, session, router, nextPath]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage(null);
    try {
      const result = await loginCoach({
        userName: String(formData.get("userName") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
      if (!result.session) {
        setStatus("error");
        setMessage(result.error ?? "Login failed.");
        return;
      }
      setSession(result.session);
      setStatus("idle");
      router.replace(nextPath);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login failed.");
    }
  }

  if (!ready) {
    return (
      <p className="text-sm text-ink-muted" aria-live="polite">
        Checking session…
      </p>
    );
  }

  if (session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">Opening your coach dashboard…</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary underline-offset-2 hover:underline"
          onClick={() => void logout()}
        >
          Log out instead
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-5">
      {message ?
        <AlertBanner tone="error">{message}</AlertBanner>
      : null}
      <TextField
        name="userName"
        label="Email or mobile"
        required
        autoComplete="username"
        placeholder="you@example.com"
        disabled={status === "loading"}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
        disabled={status === "loading"}
      />
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary underline-offset-2 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        aria-busy={status === "loading"}
        className="mc-btn-primary mc-btn-pay mt-1 w-full"
      >
        {status === "loading" ? "Signing in" : "Sign in"}
      </button>

      <p className="border-t border-line pt-5 text-center text-sm text-ink-muted">
        New here?{" "}
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center font-semibold text-mc-secondary hover:underline"
        >
          Register as a coach
        </Link>
      </p>
    </form>
  );
}
