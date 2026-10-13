import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { PageBanner } from "@/components/marketing/page-banner";
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

const points = [
  "Instant BMI with a health category",
  "Nothing is stored until you ask for a callback",
  "Then browse coaches who fit the goal",
] as const;

export default function BmiPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "BMI" }]}
        eyebrow="Free health tool"
        title="Know your BMI,"
        emphasis="know your health"
        subtitle="A quick check, then a coach can call you back. Free, and nothing is stored until you ask."
      />
      <section className="bg-[color:var(--mc-explore-canvas)] py-10 sm:py-14">
        <div className="container grid items-start gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <aside className="space-y-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_12px_36px_rgba(23,134,118,0.12)]">
              <Image
                src={photography.bmi}
                alt="A height check in a coaching studio"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 34vw"
              />
            </div>
            <ul className="space-y-3 rounded-[22px] border border-line bg-white p-5">
              {points.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-ink">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-mc-primary"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-muted">
              Prefer to browse first?{" "}
              <Link href="/coach" className="font-semibold text-mc-secondary">
                Find a Coach
              </Link>
            </p>
          </aside>
          <BmiCalculator />
        </div>
      </section>
    </>
  );
}

function BmiCalculatorSkeleton() {
  return (
    <div
      className="grid gap-6 rounded-[var(--radius-lg)] bg-mc-secondary p-5 sm:p-8 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading BMI calculator"
    >
      <div className="h-64 animate-pulse rounded-2xl bg-white/10" />
      <div className="h-64 animate-pulse rounded-2xl bg-white/10" />
    </div>
  );
}
