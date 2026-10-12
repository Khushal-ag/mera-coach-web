import { Suspense } from "react";

import { AuthShell } from "@/components/auth-shell";
import { CoachLoginForm } from "@/components/coach-login-form";
import { photography } from "@/config/photography";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Coach Login",
  description: "Sign in to your Mera Coach coach account.",
  path: "/coach-login",
});

export default function CoachLoginPage() {
  return (
    <AuthShell
      layout="single"
      panel="light"
      image={photography.authLogin}
      imageAlt="Someone walking into a neighbourhood gym at dusk"
      crumbs={[{ label: "Home", href: "/" }, { label: "Coach Login" }]}
      title={
        <>
          Coach{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Login</span>
        </>
      }
      subtitle="Sign in to manage clients, leads, packages, and your public profile, plus Premium checkout."
      panelHeading="Sign in"
      panelSubheading="Enter your credentials to continue"
    >
      <Suspense
        fallback={
          <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Loading sign in"
          >
            <div className="h-11 animate-pulse rounded-[10px] bg-line" />
            <div className="h-11 animate-pulse rounded-[10px] bg-line" />
            <div className="h-12 animate-pulse rounded-full bg-line" />
          </div>
        }
      >
        <CoachLoginForm />
      </Suspense>
    </AuthShell>
  );
}
