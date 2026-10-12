import Link from "next/link";

import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Member access for Mera Coach clients.",
};

export default function MemberLoginPage() {
  return (
    <AuthShell
      layout="split"
      crumbs={[{ label: "Home", href: "/" }, { label: "Member Login" }]}
      title={
        <>
          Member{" "}
          <span className="text-[color:var(--mc-brand-coach)]">Login</span>
        </>
      }
      subtitle="Client access now lives in the Mera Coach mobile app."
      sideTitle={
        <>
          Your coaching,{" "}
          <span className="text-[color:var(--mc-brand-coach)]">on the go</span>
        </>
      }
      sideBody="If your coach invited you, open the Mera Coach app with the credentials they shared. This website is for discovering coaches and coach registration."
    >
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Open the app
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Legacy website member login is being replaced by the native Mera
            Coach experience. Continue in the app for plans, check-ins, and
            progress with your coach.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/coach" className="mc-btn-primary w-full sm:w-auto">
            Find a Coach
          </Link>
          <Link
            href="/coach-login"
            className="mc-btn-outline-on-dark w-full sm:w-auto"
          >
            Coach Login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
