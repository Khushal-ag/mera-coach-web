import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: "Welcome - Mera Coach",
  },
  description: siteConfig.description,
};

const featureCards = [
  {
    title: "Client Management",
    image: "/mc-images/services-1.jpg",
    body: "Keep every client profile, note, and plan organized in one place so you can coach with clarity.",
  },
  {
    title: "Progress Tracking",
    image: "/mc-images/services-2.jpg",
    body: "Track assessments, milestones, and results so clients stay motivated and accountable.",
  },
  {
    title: "Lead Management",
    image: "/mc-images/services-3.jpg",
    body: "Capture enquiries from your public profile and turn interested visitors into active clients.",
  },
  {
    title: "Personal Landing Pages",
    image: "/mc-images/services-3.jpg",
    body: "Share a branded coach page that showcases your services and makes it easy to start a conversation.",
  },
] as const;

const testimonials = [
  {
    quote:
      "Mera Coach made it simple to manage clients and show progress. My practice feels more professional overnight.",
    name: "Priya Sharma",
    role: "Wellness Coach",
  },
  {
    quote:
      "The public profile and lead form bring serious enquiries. I spend less time chasing and more time coaching.",
    name: "Rahul Mehta",
    role: "Fitness Coach",
  },
  {
    quote:
      "Diet plans, check-ins, and client notes finally live in one workflow. Exactly what my clinic needed.",
    name: "Ananya Desai",
    role: "Dietician",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate flex min-h-[92dvh] items-center justify-center overflow-hidden bg-mc-home text-white">
        <video
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/mc-images/coachbg.jpg"
        >
          <source src="/mc-video/pexels-2022395.mp4" type="video/mp4" />
        </video>
        <div className="mc-hero-scrim absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
          <Image
            src="/mc-images/meracoach.png"
            alt="Mera Coach"
            width={220}
            height={220}
            className="motion-rise h-auto w-32 object-contain sm:w-40 md:w-52"
            priority
          />
          <h1 className="motion-rise motion-rise-delay-1 mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            <span className="text-[color:var(--mc-brand-mera-on-dark)]">
              Mera
            </span>{" "}
            <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
          </h1>
          <p className="motion-rise motion-rise-delay-2 mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
            Manage clients, track progress, and build your coaching brand in one
            platform built for health and wellness professionals.
          </p>
          <div className="motion-rise motion-rise-delay-3 mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link href="/register" className="mc-btn-primary w-full sm:w-auto">
              Start as a Coach
            </Link>
            <Link href="/coach" className="mc-btn-ghost w-full sm:w-auto">
              Find a Coach
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper-elevated py-12 sm:py-16 lg:py-20">
        <div className="container">
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Built for Health &amp; Wellness Coaches
          </h2>
          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <article key={card.title} className="mc-card">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {card.body}
                  </p>
                  <Link
                    href="/services"
                    className="mt-4 inline-flex text-xs font-bold tracking-wide text-mc-brand-coach uppercase hover:text-mc-primary"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-hero py-12 text-white sm:py-16 lg:py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            What You Can Do
          </h2>
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
            <div
              className="min-h-44 rounded-2xl bg-cover bg-center sm:min-h-56"
              style={{ backgroundImage: "url(/mc-images/services-1.jpg)" }}
            />
            <div
              className="min-h-44 rounded-2xl bg-cover bg-center sm:min-h-56"
              style={{ backgroundImage: "url(/mc-images/services-2.jpg)" }}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div
              className="min-h-32 rounded-2xl bg-cover bg-center sm:min-h-36"
              style={{ backgroundImage: "url(/mc-images/services-3.jpg)" }}
            />
            <div
              className="min-h-32 rounded-2xl bg-cover bg-center sm:min-h-36"
              style={{ backgroundImage: "url(/mc-images/coachservicesbg.jpg)" }}
            />
            <div
              className="min-h-32 rounded-2xl bg-cover bg-center sm:min-h-36"
              style={{ backgroundImage: "url(/mc-images/fromimg.png)" }}
            />
          </div>
          <p className="mt-8 text-base text-white/80 sm:text-lg">
            Trainer-led programs and personalized coaching, delivered through
            one platform for you and your clients.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 sm:py-16 lg:py-20">
        <div className="container grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Find the right coach for your goals
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              Browse public coach profiles for free, send an enquiry, and start
              your wellness journey with certified professionals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/coach" className="mc-btn-primary w-full sm:w-auto">
                Find a Coach
              </Link>
              <Link
                href="/register"
                className="mc-btn-secondary w-full sm:w-auto"
              >
                Join as Coach
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl">
            <Image
              src="/mc-images/fromimg.png"
              alt="Coaching"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </div>
      </section>

      <section className="bg-paper-elevated py-12 sm:py-16 lg:py-20">
        <div className="container">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Happy Clients &amp; Coaches
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ink-muted sm:text-base">
            Real results from coaches and clients growing with Mera Coach.
          </p>
          <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <blockquote
                key={item.name}
                className={[
                  "rounded-2xl p-6 text-white shadow-lg",
                  index % 3 === 0 && "mc-gradient-header",
                  index % 3 === 1 && "bg-mc-brand-coach",
                  index % 3 === 2 && "bg-mc-accent-ink",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className="text-sm leading-relaxed text-white/90">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-5">
                  <p className="font-display font-bold">{item.name}</p>
                  <p className="text-sm text-white/70">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mc-gradient-cta py-12 text-center text-white sm:py-16 lg:py-20">
        <div className="container">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Ready to grow your coaching practice?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Register as a coach, publish your profile, and start managing
            clients on Mera Coach.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-bold text-mc-secondary-dark transition hover:bg-mc-explore sm:w-auto"
          >
            Register Coach
          </Link>
        </div>
      </section>
    </>
  );
}
