import Image from "next/image";
import Link from "next/link";

import { photography } from "@/config/photography";
import { siteConfig } from "@/config/site";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Welcome - Mera Coach",
  description: siteConfig.description,
  path: "/",
  absolute: true,
});

const howItWorks = [
  {
    step: "01",
    title: "Publish your profile",
    body: "Show your specialty, city, and packages so people can find you.",
  },
  {
    step: "02",
    title: "Receive enquiries",
    body: "People send a free enquiry from your public page. You follow up when you are ready.",
  },
  {
    step: "03",
    title: "Coach your clients",
    body: "Keep clients, packages, and events together on the web, and on the floor in the app.",
  },
] as const;

const coachPoints = [
  {
    title: "Manage clients",
    body: "Profiles, notes, and plans in one place so you coach with clarity.",
  },
  {
    title: "Track progress",
    body: "Assessments and milestones that keep clients accountable.",
  },
  {
    title: "Get new clients",
    body: "Turn profile enquiries into booked personal-training clients.",
  },
  {
    title: "Professional profile",
    body: "A public page that presents your coaching without a separate website.",
  },
] as const;

const seekerPoints = [
  "Browse public coach profiles for free",
  "Compare specialty, city, and experience",
  "Send an enquiry when you are ready to train",
] as const;

const testimonials = [
  {
    quote:
      "Client notes and progress finally live in one place. My coaching feels sharper.",
    name: "Priya Sharma",
    role: "Personal Trainer",
  },
  {
    quote:
      "The public profile brings serious enquiries. Less chasing, more coaching.",
    name: "Rahul Mehta",
    role: "Fitness Coach",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate flex min-h-[calc(100dvh-4.25rem)] items-end overflow-hidden bg-mc-home text-white">
        <Image
          src={photography.homeHero}
          alt="Coach spotting a squat in a neighbourhood gym"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[28%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--mc-home-canvas)]/92 via-[color:var(--mc-home-canvas)]/28 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 container w-full pt-8 pb-10 sm:pb-14">
          <div className="max-w-3xl">
            <p className="motion-rise text-sm font-semibold text-white/80">
              Personal trainers, coaches, and the people who train with them
            </p>
            <h1 className="motion-rise motion-rise-delay-1 mt-3 max-w-[14em] font-display text-[1.7rem] leading-[1.12] font-extrabold tracking-tight text-balance text-white sm:max-w-[16em] sm:text-5xl lg:text-[3.15rem]">
              Grow your{" "}
              <span className="text-[color:var(--mc-brand-coach)]">
                coaching
              </span>{" "}
              with Mera Coach
            </h1>
            <div
              className="motion-rise motion-rise-delay-1 motion-underline mt-4 h-1 w-16 origin-left rounded-full bg-[color:var(--mc-brand-coach)] sm:w-20"
              aria-hidden
            />
            <p className="motion-rise motion-rise-delay-2 mt-4 max-w-[40ch] text-sm leading-relaxed text-white/90 sm:text-base">
              Get found by clients. Keep the relationship in one place, from the
              first enquiry to the next session.
            </p>
            <div className="motion-rise motion-rise-delay-2 mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="mc-btn-primary mc-btn-home w-full sm:w-auto"
              >
                Start as a Coach
              </Link>
              <Link href="/coach" className="mc-btn-ghost w-full sm:w-auto">
                Find a Coach
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20 lg:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="motion-reveal relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src={photography.services}
              alt="Coach guiding a client through a session"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-mc-secondary">
              How it works
            </p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
              From a public page to a full client list
            </h2>
            <ol className="mt-8 border-t border-[color:var(--mc-secondary)]/15">
              {howItWorks.map((step) => (
                <li
                  key={step.step}
                  className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 border-b border-[color:var(--mc-secondary)]/15 py-5 sm:py-6"
                >
                  <span className="font-display text-lg font-bold text-[color:var(--mc-brand-coach)]">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-muted sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold text-mc-secondary">
              For coaches
            </p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
              Built for personal trainers and coaches
            </h2>
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Publish once, then manage clients, leads, packages, and events
              from the same account. The app stays with you between sets.
            </p>
            <ul className="mt-8 border-t border-[color:var(--mc-secondary)]/15">
              {coachPoints.map((item) => (
                <li
                  key={item.title}
                  className="border-b border-[color:var(--mc-secondary)]/15 py-4 sm:py-5"
                >
                  <h3 className="font-display text-lg font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 max-w-[42ch] text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="mc-btn-primary w-full sm:w-auto"
              >
                Start as a Coach
              </Link>
              <Link
                href="/services"
                className="mc-btn-secondary w-full sm:w-auto"
              >
                See what coaches use
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] lg:aspect-[5/6]">
            <Image
              src={photography.homeFloor}
              alt="Coach and client talking between sets"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--mc-explore-canvas)] py-16 sm:py-20 lg:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="motion-reveal relative order-2 aspect-[16/11] overflow-hidden rounded-[var(--radius-lg)] lg:order-1">
            <Image
              src={photography.findCoach}
              alt="Coach and client reviewing a training plan"
              fill
              className="object-cover object-[center_40%]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold text-mc-secondary">
              Looking for a coach
            </p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
              Find a coach who fits how you want to train
            </h2>
            <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Browse public profiles, compare specialties, and send an enquiry.
              Exploring is free.
            </p>
            <ul className="mt-6 space-y-3">
              {seekerPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm leading-relaxed text-ink sm:text-base"
                >
                  <span
                    className="mt-2 size-2 shrink-0 rounded-full bg-[color:var(--mc-brand-coach)]"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/coach" className="mc-btn-primary w-full sm:w-auto">
                Find a Coach
              </Link>
              <Link href="/bmi" className="mc-btn-secondary w-full sm:w-auto">
                Check your BMI
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20 lg:py-24">
        <div className="container">
          <h2 className="max-w-xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Coaches already using Mera Coach
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-line bg-surface p-7 sm:p-9"
              >
                <p className="font-display text-lg leading-relaxed font-bold text-ink sm:text-xl">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-8 border-t border-line pt-5">
                  <p className="font-display font-bold text-ink">{item.name}</p>
                  <p className="text-sm text-ink-muted">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-cta py-16 text-white sm:py-20">
        <div className="container grid items-end gap-8 lg:grid-cols-[1.2fr_auto] lg:text-left">
          <div>
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to grow your coaching?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              Publish your profile, take enquiries, and manage clients on Mera
              Coach.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-mc-secondary hover:bg-mc-explore"
            >
              Start as a Coach
            </Link>
            <Link href="/coach" className="mc-btn-ghost min-h-12">
              Find a Coach
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
