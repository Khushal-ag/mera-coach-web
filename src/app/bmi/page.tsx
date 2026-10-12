import Link from "next/link";

import type { Metadata } from "next";

import { BmiCalculator } from "@/components/bmi-calculator";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "BMI Calculator",
  description:
    "Check your BMI in seconds on Mera Coach, then share your details so a coach can call you back. Free, no commitment.",
};

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
