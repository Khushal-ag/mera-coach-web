import { Suspense } from "react";

import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";
import { CoachLoginForm } from "@/components/coach-login-form";

export const metadata: Metadata = {
  title: "Coach Login",
  description: "Sign in to your Mera Coach coach account.",
};

export default function CoachLoginPage() {
  return (
    <AuthShell
      layout="split"
      crumbs={[{ label: "Home", href: "/" }, { label: "Coach Login" }]}
      title={
        <>
          Coach{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Login</span>
        </>
      }
      subtitle="Sign in to manage clients, leads, packages, and your public profile — plus Premium checkout."
      sideTitle={
        <>
          Welcome back,{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
        </>
      }
      sideBody="One login for your practice on the web: dashboard, clients, events, and profile sharing."
      panelHeading="Sign in"
      panelSubheading="Enter your credentials to continue"
    >
      <Suspense
        fallback={
          <p className="text-sm text-white/65" aria-live="polite">
            Loading…
          </p>
        }
      >
        <CoachLoginForm />
      </Suspense>
    </AuthShell>
  );
}
