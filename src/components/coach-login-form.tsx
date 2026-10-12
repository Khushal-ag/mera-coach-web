"use client";

import { useState } from "react";
import Link from "next/link";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { firstApiError, isApiSuccess, loginCoach } from "@/lib/api";

const TOKEN_KEY = "mc_coach_token";

export function CoachLoginForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [premiumHref, setPremiumHref] = useState("/premium");

  async function onSubmit(formData: FormData) {
    setStatus("loading");
    setMessage(null);
    try {
      const response = await loginCoach({
        userName: String(formData.get("userName") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
      if (!isApiSuccess(response) || !response.responseObj?.token) {
        setStatus("error");
        setMessage(firstApiError(response) ?? "Login failed.");
        return;
      }
      window.localStorage.setItem(TOKEN_KEY, response.responseObj.token);
      const id = response.responseObj.coachId;
      const code = response.responseObj.coachCode?.trim();
      const premiumQs = new URLSearchParams();
      if (id && id > 0) premiumQs.set("coachId", String(id));
      if (code) premiumQs.set("coachCode", code);
      setPremiumHref(
        premiumQs.toString() ? `/premium?${premiumQs.toString()}` : "/premium",
      );
      setStatus("success");
      setMessage(
        "Signed in. Coach CRM lives in the Mera Coach app. Open the app to manage clients. Premium checkout is available on this website.",
      );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Login failed.");
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <TextField
        name="userName"
        label="Email or mobile"
        required
        autoComplete="username"
        tone="dark"
        placeholder="you@example.com"
        disabled={status === "loading"}
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        tone="dark"
        placeholder="••••••••"
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="mc-btn-primary mt-1 w-full"
      >
        {status === "loading" ? "Signing in…" : "Sign in"}
      </button>

      {message ?
        <AlertBanner
          tone={status === "success" ? "success" : "error"}
          className={
            status === "success" ?
              "border-white/20 bg-white/10 text-white"
            : undefined
          }
        >
          {message}
        </AlertBanner>
      : null}

      {status === "success" ?
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
          <Link
            href={premiumHref}
            className="mc-btn-outline-on-dark w-full justify-center text-xs sm:w-auto"
          >
            Go to Premium
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/30 px-4 text-xs font-bold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Not registered?
          </Link>
        </div>
      : <p className="border-t border-white/10 pt-5 text-center text-sm text-white/70">
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-[color:var(--mc-brand-coach)] transition-colors hover:brightness-110"
          >
            Register as a coach
          </Link>
        </p>
      }
    </form>
  );
}
