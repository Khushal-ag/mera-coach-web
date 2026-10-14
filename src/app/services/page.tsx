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

      <div className="border-b border-line bg-white">
        <div className="container flex gap-2 overflow-x-auto py-3">
          {offerings.map((item) => (
            <a
              key={item.title}
              href={`#${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-mc-secondary-light px-4 text-sm font-semibold text-mc-secondary"
            >
              {item.title}
            </a>
          ))}
        </div>
      </div>

      <section id="coaching" className="bg-paper py-14 sm:py-16">
        <div className="container">
          <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] shadow-[0_12px_36px_rgba(44,24,16,0.12)]">
              <Image
                src={photography.services}
                alt="Coach watching a kettlebell setup in a daylight studio"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 34vw"
              />
            </div>
            <div>
              <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary-light px-3 py-1 font-display text-xs font-bold text-mc-secondary">
                Coaching programs
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">
                Expert-led coaching programs
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                Exercise, nutrition, and diet programs sit with the same coach
                tools used to manage clients.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {offerings.map((item) => (
              <article
                key={item.title}
                id={item.title.toLowerCase().replace(/\s+/g, "-")}
                className="flex flex-col overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
              >
                <div className="bg-mc-secondary px-5 py-4 text-white">
                  <h3 className="font-display text-lg font-bold">
                    {item.title}
                  </h3>
                </div>
                <p className="flex-1 p-5 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
                <div className="px-5 pb-5">
                  <Link
                    href="/coach"
                    className="text-sm font-semibold text-mc-secondary"
                  >
                    Find a coach
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[image:var(--mc-gradient)] py-16 text-white sm:py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Manage every client professionally
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
            Profiles, assessments, and reports live next to the public page.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {clientTools.map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] bg-white p-5 text-ink"
              >
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Show progress. Build trust.
          </h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {progressPoints.map((item) => (
              <article
                key={item.title}
                className="rounded-[20px] border border-line bg-white p-5"
              >
                <h3 className="font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </article>
            ))}
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
