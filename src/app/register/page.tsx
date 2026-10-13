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
      layout="card"
      panel="light"
      image={photography.authRegister}
      imageAlt="Coach setting dumbbells on a rack before a session"
      crumbs={[{ label: "Home", href: "/" }, { label: "Register" }]}
      title={
        <>
          Start <span className="text-mc-brand-coach">coaching</span>
        </>
      }
      subtitle="A public profile, client tools, and enquiries in one account. We review new coaches before listing."
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
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading registration"
    >
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-line" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-11 animate-pulse rounded-[10px] bg-line" />
            <div className="h-11 animate-pulse rounded-[10px] bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
