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

const coachingPoints = [
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
    body: "A public page that sells your coaching for you.",
  },
] as const;

const bridgeSteps = [
  {
    title: "Publish your profile",
    body: "Show specialty, city, and packages so clients can find you.",
  },
  {
    title: "Receive enquiries",
    body: "Serious leads reach you from the public listing and app.",
  },
  {
    title: "Coach your clients",
    body: "Manage clients, packages, and events on the web or in the app.",
  },
] as const;

const testimonials = [
  {
    quote:
      "Client notes and progress finally live in one place. My coaching business feels sharper.",
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
            <h1 className="motion-rise max-w-[20em] font-display text-[1.7rem] leading-[1.12] font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.15rem]">
              Grow your{" "}
              <span className="text-[color:var(--mc-brand-coach)]">
                coaching
              </span>{" "}
              business with Mera{" "}
              <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
            </h1>
            <div
              className="motion-rise motion-rise-delay-1 motion-underline mt-4 h-1 w-16 origin-left rounded-full bg-[color:var(--mc-brand-coach)] sm:w-20"
              aria-hidden
            />
            <p className="motion-rise motion-rise-delay-1 mt-4 max-w-[36ch] text-sm leading-relaxed text-white/90 sm:text-base">
              Get found by clients. Grow your coaching business.
            </p>
            <div className="motion-rise motion-rise-delay-2 mt-6 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className="mc-btn-primary w-full sm:w-auto"
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
        <div className="container grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="max-w-md font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
              Personal training that connects coach and client
            </h2>
            <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Mera Coach is built for the relationship: a public profile that
              brings people in, and tools that keep clients and coaching on
              track.
            </p>
          </div>

          <ol className="border-t border-[color:var(--mc-secondary)]/15">
            {bridgeSteps.map((step) => (
              <li
                key={step.title}
                className="border-b border-[color:var(--mc-secondary)]/15 py-5 sm:py-6"
              >
                <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-muted sm:text-base">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="motion-reveal relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] lg:aspect-[4/5]">
            <Image
              src={photography.homeFloor}
              alt="Coach and client talking between sets"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>

          <div>
            <h2 className="max-w-md font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Built for personal trainers and coaches
            </h2>
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Manage clients, track progress, and keep the public listing that
              brings leads in.
            </p>

            <ul className="mt-8 border-t border-[color:var(--mc-secondary)]/15">
              {coachingPoints.map((item) => (
                <li
                  key={item.title}
                  className="border-b border-[color:var(--mc-secondary)]/15 py-4 sm:py-5"
                >
                  <h3 className="font-display text-lg font-bold text-ink sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1 max-w-[42ch] text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--mc-explore-canvas)] py-16 sm:py-20 lg:py-24">
        <div className="container">
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
            Discover on the web. Coach on web or app.
          </h2>
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-ink-muted sm:text-base">
            Get listed, get found, manage your clients, and upgrade your
            subscription on the website. The app stays with you on the floor.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="rounded-[var(--radius-lg)] bg-[color:var(--mc-header-bottom)] p-7 text-white sm:p-9">
              <p className="font-display text-2xl font-bold">On the website</p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/80 sm:text-base">
                <li>Register, publish, and share your coach profile</li>
                <li>Manage clients, leads, packages, and events</li>
                <li>Premium checkout and client feedback forms</li>
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="mc-btn-primary w-full sm:w-auto"
                >
                  Start as a Coach
                </Link>
                <Link
                  href="/coach-login"
                  className="mc-btn-outline-on-dark w-full sm:w-auto"
                >
                  Coach Login
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--mc-secondary)]/15 bg-surface p-7 sm:p-9">
              <div>
                <p className="font-display text-2xl font-bold text-ink">
                  In the app
                </p>
                <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-muted sm:text-base">
                  The same coaching on your phone, plus BMI checkups and diet
                  plans where you train.
                </p>
              </div>
              <Link
                href="/services"
                className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-mc-brand-coach"
              >
                See what coaches use
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20 lg:py-24">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Find your personal coach
          </h2>
          <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-muted sm:text-base">
            Browse public profiles free, send an enquiry, and start training
            with a coach who fits your goals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/coach" className="mc-btn-primary w-full sm:w-auto">
              Find a Coach
            </Link>
            <Link href="/bmi" className="mc-btn-secondary w-full sm:w-auto">
              Check your BMI
            </Link>
          </div>
        </div>
      </section>

      <section className="mc-gradient-hero py-16 text-white sm:py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Train together. Build trust.
          </h2>
          <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-white/75 sm:text-base">
            One-to-one coaching sessions, progress you can see, and tools for
            you and your clients.
          </p>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20 lg:py-24">
        <div className="container">
          <h2 className="motion-reveal max-w-xl font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Trusted by coaches
          </h2>
          <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-2">
            {testimonials.map((item, index) => (
              <blockquote
                key={item.name}
                className={[
                  "motion-reveal flex flex-col justify-between rounded-[var(--radius-lg)] p-7 text-white sm:p-9",
                  index === 0 ? "mc-gradient-header" : "bg-mc-brand-coach",
                ].join(" ")}
                style={{ animationDelay: `${0.08 * (index + 1)}s` }}
              >
                <p className="text-base leading-relaxed text-white/92 sm:text-lg">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-8">
                  <p className="font-display text-lg font-bold">{item.name}</p>
                  <p className="text-sm text-white/70">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-cta py-16 text-center text-white sm:py-20">
        <div className="container">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Ready to grow your coaching business?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/80 sm:text-base">
            Publish your profile, capture leads, and manage clients on Mera
            Coach.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-mc-secondary-dark transition hover:bg-mc-explore active:scale-[0.98] sm:w-auto"
          >
            Start as a Coach
          </Link>
        </div>
      </section>
    </>
  );
}
