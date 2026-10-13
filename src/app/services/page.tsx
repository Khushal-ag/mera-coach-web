import Image from "next/image";
import Link from "next/link";

import { PageBanner } from "@/components/marketing/page-banner";
import { photography } from "@/config/photography";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Services",
  description:
    "Power your coaching business with exercise programs, nutrition plans, client management, and a public coach page on Mera Coach.",
  path: "/services",
});

const offerings = [
  {
    title: "Exercise programs",
    body: "Structured workout plans tailored to fitness level. Build strength, endurance, and performance with proven training methods.",
  },
  {
    title: "Nutrition plans",
    body: "Personalized meal plans and dietary guidance that fuel training, recovery, and everyday energy.",
  },
  {
    title: "Diet programs",
    body: "Multi-meal diet plans for weight goals, training fuel, and recovery, built with the same coach who trains you.",
  },
] as const;

const clientTools = [
  {
    title: "Detailed client profiles",
    body: "Personal details, health history, preferences, and coaching notes in one profile.",
  },
  {
    title: "Health data and assessments",
    body: "Vital metrics, body assessments, and fitness evaluations for a complete picture.",
  },
  {
    title: "Reports and recommendations",
    body: "Structured reports that guide clients at every stage of the program.",
  },
] as const;

const progressPoints = [
  {
    title: "Visual progress",
    body: "Charts and timelines that make improvements tangible.",
  },
  {
    title: "Goals and milestones",
    body: "Clear targets that keep clients engaged.",
  },
  {
    title: "Steady engagement",
    body: "Regular check-ins that drive measurable change.",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        eyebrow="For coaches"
        title="Power your"
        emphasis="coaching business"
        subtitle="Exercise, nutrition, and client tools for personal trainers who train people one-to-one."
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="mc-btn-primary w-full sm:w-auto">
            Start as a Coach
          </Link>
          <Link
            href="/coach"
            className="mc-btn-outline-on-dark w-full sm:w-auto"
          >
            Find a Coach
          </Link>
        </div>
      </PageBanner>

      <section className="bg-[#f5ede0] py-14 sm:py-16">
        <div className="container grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_12px_36px_rgba(44,24,16,0.12)]">
            <Image
              src={photography.services}
              alt="Coach watching a kettlebell setup in a daylight studio"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
          <div className="grid gap-4">
            {offerings.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
              >
                <h2 className="font-display text-lg font-bold text-ink">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-header py-16 text-white sm:py-20 lg:py-24">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Manage every client professionally
            </h2>
            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-white/75 sm:text-base">
              Run your coaching business with clarity, from first assessment to
              follow-up.
            </p>
            <Link
              href="/register"
              className="mc-btn-primary mt-8 w-full sm:w-auto"
            >
              Start as a Coach
            </Link>
          </div>
          <ul className="divide-y divide-white/15 border-y border-white/15">
            {clientTools.map((item) => (
              <li
                key={item.title}
                className="py-6 first:pt-0 last:pb-0 sm:py-7"
              >
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-white/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-mc-accent-ink py-16 text-white sm:py-20 lg:py-24">
        <div className="container">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Show progress. Build trust.
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-white/75 sm:text-base">
            Help clients stay motivated with clear signals of improvement.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div>
              <h3 className="font-display text-2xl font-bold sm:text-3xl">
                {progressPoints[0].title}
              </h3>
              <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-white/70 sm:text-base">
                {progressPoints[0].body}
              </p>
            </div>
            <div className="space-y-6 border-t border-white/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              {progressPoints.slice(1).map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-lg font-bold sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="container max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Grow your coaching business
          </h2>
          <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-muted sm:text-base">
            Grow beyond one-on-one sessions with a branded page, lead capture,
            and premium tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/register" className="mc-btn-primary w-full sm:w-auto">
              Start as a Coach
            </Link>
            <Link href="/bmi" className="mc-btn-secondary w-full sm:w-auto">
              Check your BMI
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
