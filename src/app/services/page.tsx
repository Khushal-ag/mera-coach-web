import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Power your coaching services with exercise programs, nutrition plans, client management, and branded landing pages on Mera Coach.",
};

const offerCards = [
  {
    tag: "Fitness",
    title: "Exercise Program",
    image: "/mc-images/services-1.jpg",
    body: "Structured workout plans tailored to fitness level. Build strength, endurance, and performance with proven training methods.",
  },
  {
    tag: "Nutrition",
    title: "Nutrition Plans",
    image: "/mc-images/services-2.jpg",
    body: "Personalized meal plans and dietary guidance to fuel the body, improve gut health, and optimize daily energy.",
  },
  {
    tag: "Wellness",
    title: "Diet Program",
    image: "/mc-images/services-3.jpg",
    body: "Science-backed diet programs for weight management, digestive health, heart health, and skin wellness.",
  },
] as const;

const manageCards = [
  {
    tag: "Profiles",
    title: "Detailed Client Profiles",
    body: "Maintain comprehensive profiles for every client including personal details, health history, preferences, and coaching notes.",
  },
  {
    tag: "Assessments",
    title: "Health Data & Assessments",
    body: "Record vital health metrics, body assessments, and fitness evaluations for a complete wellness picture.",
  },
  {
    tag: "Tracking",
    title: "Reports & Recommendations",
    body: "Store structured reports and personalized recommendations that guide clients at every stage.",
  },
] as const;

const progressCards = [
  {
    title: "Visual Progress Tracking",
    body: "Present progress through charts and timelines that make improvements tangible and motivating.",
  },
  {
    title: "Goal Setting & Milestones",
    body: "Define clear goals and celebrate milestones to keep clients engaged throughout the program.",
  },
  {
    title: "Continuous Engagement",
    body: "Maintain regular touchpoints and check-ins that drive measurable improvements.",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        title={
          <>
            Power{" "}
            <span className="text-[color:var(--mc-brand-coach)]">
              Your Coaching Services
            </span>
          </>
        }
        subtitle="Mera Coach helps you offer structured, personalized, and trackable health services to your clients."
      />

      <section className="bg-paper-elevated py-12 sm:py-16 lg:py-20">
        <div className="container">
          <SectionHeader
            title={
              <>
                Offer{" "}
                <span className="text-mc-brand-coach">
                  Complete Coaching Services
                </span>
              </>
            }
            subtitle="Design and deliver multiple health and wellness services:"
          />
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 md:grid-cols-3">
            {offerCards.map((card) => (
              <article key={card.title} className="mc-card">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-mc-header-bottom/80 px-3 py-1 text-xs font-semibold text-white">
                    {card.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {card.body}
                  </p>
                  <Link
                    href="/coach"
                    className="mt-4 inline-flex text-sm font-semibold text-mc-brand-coach hover:text-mc-primary"
                  >
                    Find a Coach
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-header py-12 text-white sm:py-16 lg:py-20">
        <div className="container">
          <SectionHeader
            light
            title={
              <>
                Manage Every Client{" "}
                <span className="text-[color:var(--mc-brand-coach)]">
                  Professionally
                </span>
              </>
            }
            subtitle="Handle your coaching practice with clarity and efficiency:"
          />
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 md:grid-cols-3">
            {manageCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="text-xs font-semibold tracking-wide text-[color:var(--mc-brand-coach)] uppercase">
                  {card.tag}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {card.body}
                </p>
                <Link
                  href="/register"
                  className="mt-4 inline-flex text-sm font-semibold text-[color:var(--mc-brand-coach)] hover:brightness-110"
                >
                  Get Started
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mc-accent-ink py-12 text-white sm:py-16 lg:py-20">
        <div className="container">
          <SectionHeader
            light
            title={
              <>
                Show Progress,{" "}
                <span className="text-[color:var(--mc-brand-coach)]">
                  Build Trust
                </span>
              </>
            }
            subtitle="Help your clients stay motivated and committed:"
          />
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 md:grid-cols-3">
            {progressCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="font-display text-xl font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper-elevated py-12 sm:py-16 lg:py-20">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Turn{" "}
            <span className="text-mc-brand-coach">Services into Business</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-muted sm:text-base">
            Grow beyond one-on-one coaching with branded pages, lead capture,
            and premium tools that help you scale your practice.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/register" className="mc-btn-primary w-full sm:w-auto">
              Register Coach
            </Link>
            <Link href="/premium" className="mc-btn-secondary w-full sm:w-auto">
              View Premium
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({
  title,
  subtitle,
  light = false,
}: {
  title: React.ReactNode;
  subtitle: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <h2
        className={`font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      <div className="mt-3 h-1 w-16 bg-mc-brand-coach" aria-hidden />
      <p className={`mt-4 ${light ? "text-white/75" : "text-ink-muted"}`}>
        {subtitle}
      </p>
    </div>
  );
}
