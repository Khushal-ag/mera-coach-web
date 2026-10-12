import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { photography } from "@/config/photography";
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
    <section className="bg-[color:var(--mc-explore-canvas)]">
      <div className="container grid items-start gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:py-16">
        <div className="order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src={photography.bmi}
              alt="Coach measuring a client's height against a wall"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="flex flex-wrap items-center gap-y-1 text-sm text-ink-muted">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center hover:text-mc-brand-coach"
            >
              Home
            </Link>
            <span className="mx-1.5 text-ink-muted/50" aria-hidden>
              ›
            </span>
            <span>BMI</span>
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.08] font-bold tracking-tight text-ink sm:text-5xl">
            Check your{" "}
            <span className="text-[color:var(--mc-brand-coach)]">BMI</span>
          </h1>
          <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-muted sm:text-base">
            Get your BMI in seconds. Then share your details with a coach.
          </p>

          <div className="mt-8">
            <BmiCalculator />
          </div>

          <p className="mt-8 text-sm text-ink-muted">
            Prefer to browse first?{" "}
            <Link href="/coach" className="font-semibold text-mc-brand-coach">
              Find a Coach
            </Link>
          </p>
        </div>
      </div>
    </section>
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
        <div className="mc-skeleton h-6 w-40" />
        <div className="mc-skeleton h-11 rounded-[10px]" />
        <div className="mc-skeleton h-11 rounded-[10px]" />
        <div className="mc-skeleton h-12 rounded-full" />
      </div>
      <div className="mc-skeleton h-40 rounded-[var(--radius-md)]" />
    </div>
  );
}
