import Link from "next/link";

import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Coach Registration",
  description:
    "Join Mera Coach as a personal trainer or coach. Get found by clients and run the practice that follows.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      layout="single"
      panel="light"
      crumbs={[{ label: "Home", href: "/" }, { label: "Register" }]}
      title={
        <>
          Coach{" "}
          <span className="text-[color:var(--mc-brand-coach)]">
            Registration
          </span>
        </>
      }
      subtitle="Get found by clients. Build your coaching practice on Mera Coach."
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Create your coach account
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Tell us about your practice. We review new coaches before listing.
        </p>
      </div>
      <RegisterForm />
      <p className="mt-6 text-sm text-ink-muted">
        Already registered?{" "}
        <Link
          href="/coach-login"
          className="font-semibold text-mc-brand-coach hover:underline"
        >
          Coach login
        </Link>
      </p>
    </AuthShell>
  );
}
