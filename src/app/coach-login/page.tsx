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
      subtitle="Sign in with the email or mobile and password from registration. Day-to-day coaching continues in the Mera Coach mobile app."
      sideTitle={
        <>
          Welcome back,{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
        </>
      }
      sideBody="Use this portal for discovery, registration, and premium checkout. Manage clients and sessions in the Mera Coach app."
      panelHeading="Sign in"
      panelSubheading="Enter your credentials to continue"
    >
      <CoachLoginForm />
    </AuthShell>
  );
}
