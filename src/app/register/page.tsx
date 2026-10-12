import { Suspense } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { photography } from "@/config/photography";
import { fetchCoachCategories } from "@/lib/api/master";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Coach Registration",
  description:
    "Join Mera Coach as a personal trainer or coach. Get found by clients and grow your coaching business.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthShell
      layout="single"
      panel="light"
      image={photography.authRegister}
      imageAlt="Coach setting dumbbells on a rack before a session"
      crumbs={[{ label: "Home", href: "/" }, { label: "Register" }]}
      title={
        <>
          Coach{" "}
          <span className="text-[color:var(--mc-brand-coach)]">
            Registration
          </span>
        </>
      }
      subtitle="Get found by clients. Build your public profile on Mera Coach."
      panelHeading="Create your coach account"
      panelSubheading="Tell us about your coaching. We review new coaches before listing."
    >
      <Suspense fallback={<RegisterFieldsSkeleton />}>
        <RegisterFormLoader />
      </Suspense>
      <p className="mt-6 text-sm text-ink-muted">
        Already registered?{" "}
        <Link
          href="/coach-login"
          className="font-semibold text-mc-secondary hover:underline"
        >
          Coach login
        </Link>
      </p>
    </AuthShell>
  );
}

async function RegisterFormLoader() {
  const categories = await fetchCoachCategories();
  return <RegisterForm categories={categories} />;
}

function RegisterFieldsSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading registration"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-11 animate-pulse rounded-[10px] bg-line"
        />
      ))}
    </div>
  );
}
