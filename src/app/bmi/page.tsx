import dynamic from "next/dynamic";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "BMI Calculator",
  description:
    "Check your BMI in seconds on Mera Coach, then share your details so a coach can call you back. Free, no commitment.",
  path: "/bmi",
});

const BmiCalculator = dynamic(
  () => import("@/components/bmi-calculator").then((mod) => mod.BmiCalculator),
  { loading: () => <BmiCalculatorSkeleton /> },
);

export default function BmiPage() {
  return (
    <>
      <PageHero
        variant="photo"
        crumbs={[{ label: "Home", href: "/" }, { label: "BMI" }]}
        title={
          <>
            Check your{" "}
            <span className="text-[color:var(--mc-brand-coach)]">BMI</span>
          </>
        }
        subtitle="Get your BMI in seconds. Then share your details with a coach."
      />

      <section className="bg-[color:var(--mc-explore-canvas)] py-12 sm:py-16 lg:py-20">
        <div className="container max-w-5xl">
          <BmiCalculator />

          <p className="mt-10 text-center text-sm text-ink-muted">
            Prefer to browse first?{" "}
            <Link href="/coach" className="font-semibold text-mc-brand-coach">
              Find a Coach
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

function BmiCalculatorSkeleton() {
  return (
    <div
      className="grid gap-6 rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-8 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading BMI calculator"
    >
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-line" />
        <div className="h-11 animate-pulse rounded-[10px] bg-line" />
        <div className="h-11 animate-pulse rounded-[10px] bg-line" />
        <div className="h-12 animate-pulse rounded-full bg-line" />
      </div>
      <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-line" />
    </div>
  );
}
