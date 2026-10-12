import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Services",
  description:
    "Power your coaching business with exercise programs, nutrition plans, client management, and a public coach page on Mera Coach.",
  path: "/services",
});

const featuredOfferings = [
  {
    title: "Exercise programs",
    body: "Structured workout plans tailored to fitness level. Build strength, endurance, and performance with proven training methods.",
    image: "/mc-images/coachloginbg.jpg",
    imageAlt: "Trainer spotting a client during a strength session",
  },
  {
    title: "Nutrition plans",
    body: "Personalized meal plans and dietary guidance that fuel training, recovery, and everyday energy.",
    image: "/mc-images/coach-guidance.jpg",
    imageAlt: "Coach guiding a client through a training set",
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
      <PageHero
        variant="photo"
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        title={
          <>
            Power your{" "}
            <span className="text-[color:var(--mc-brand-coach)]">
              coaching business
            </span>
          </>
        }
        subtitle="Exercise, nutrition, and client tools for personal trainers who train people one-to-one."
      />

      {/* Two split features max, then a full-bleed diet band (breaks zigzag) */}
      <section className="bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="container">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Coaching you deliver in person
          </h2>
          <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-ink-muted sm:text-base">
            Design and deliver fitness and nutrition programs from one place,
            then stay close to each client.
          </p>

          <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-20">
            {featuredOfferings.map((item, index) => {
              const reverse = index % 2 === 1;
              return (
                <article
                  key={item.title}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
                >
                  <div
                    className={`relative aspect-[16/11] overflow-hidden rounded-[var(--radius-lg)] ${
                      reverse ? "lg:order-2" : ""
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                  <div className={reverse ? "lg:order-1" : undefined}>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                      {item.title}
                    </h3>
                    <div
                      className="mt-3 h-1 w-12 rounded-full bg-mc-brand-coach"
                      aria-hidden
                    />
                    <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-ink-muted sm:text-base">
                      {item.body}
                    </p>
                    <Link
                      href="/coach"
                      className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-mc-brand-coach hover:brightness-95"
                    >
                      Find a Coach
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-20 text-white sm:py-24">
        <Image
          src="/mc-images/coaching-session.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-[color:var(--mc-header-bottom)]/82"
          aria-hidden
        />
        <div className="relative z-10 container max-w-2xl">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Diet programs with your coach
          </h2>
          <div
            className="mt-3 h-1 w-12 rounded-full bg-mc-brand-coach"
            aria-hidden
          />
          <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-white/85 sm:text-base">
            Multi-meal diet plans for weight goals, training fuel, and recovery,
            built with the same coach who trains you.
          </p>
          <Link href="/coach" className="mc-btn-primary mt-8 w-full sm:w-auto">
            Find a Coach
          </Link>
        </div>
      </section>

      {/* Ops: dense list on brand band (different layout family) */}
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
          <div className="mt-10 grid gap-8 border-t border-white/15 pt-10 sm:mt-12 sm:grid-cols-3 sm:gap-10 sm:pt-12">
            {progressPoints.map((item) => (
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
      </section>

      <section className="relative overflow-hidden bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="relative container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              Grow your coaching business
            </h2>
            <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Grow beyond one-on-one sessions with a branded page, lead capture,
              and premium tools.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="mc-btn-primary w-full sm:w-auto"
              >
                Start as a Coach
              </Link>
              <Link href="/bmi" className="mc-btn-secondary w-full sm:w-auto">
                Check your BMI
              </Link>
            </div>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src="/mc-images/coach-client-pair.jpg"
              alt="Coach and client after a training walk"
              fill
              className="object-cover object-[center_30%]"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}
