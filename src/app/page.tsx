import Image from "next/image";
import Link from "next/link";

import { Briefcase, ChartLine, Globe, Search, Star, Users } from "lucide-react";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachDirectoryCard } from "@/components/coach-directory-card";
import { photography } from "@/config/photography";
import { siteConfig } from "@/config/site";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";
import { fetchCoachCategories } from "@/lib/api/master";
import { FALLBACK_COACH_CATEGORIES } from "@/lib/coach/directory";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Welcome - Mera Coach",
  description: siteConfig.description,
  path: "/",
  absolute: true,
});

const features = [
  {
    title: "Client management",
    body: "Profiles, check-ups, and history in one place so every client journey stays visible.",
    icon: Users,
    tone: "bg-[color:var(--mc-secondary)]/10 text-mc-secondary",
  },
  {
    title: "Progress tracking",
    body: "BMI, weight, and milestones over time, with a report you can share in a click.",
    icon: ChartLine,
    tone: "bg-[color:var(--mc-primary-light)] text-mc-primary",
  },
  {
    title: "Lead management",
    body: "Capture enquiries from your public page and follow up before they go cold.",
    icon: Search,
    tone: "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
  },
  {
    title: "Your landing page",
    body: "A public coach page on Mera Coach that works while you are on the floor.",
    icon: Globe,
    tone: "bg-[color:var(--mc-secondary-light)] text-mc-secondary",
  },
  {
    title: "Packages and events",
    body: "Show what you offer and what is coming up, without a separate website.",
    icon: Briefcase,
    tone: "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
  },
  {
    title: "A coaching brand",
    body: "Specialty, city, and proof of work, presented the way clients actually browse.",
    icon: Star,
    tone: "bg-[color:var(--mc-primary-light)] text-mc-primary",
  },
] as const;

const steps = [
  {
    n: "1",
    title: "Sign up as a coach",
    body: "Create your account, pick your category, and join the directory in minutes.",
  },
  {
    n: "2",
    title: "Set up your profile",
    body: "Add services, packages, and a short story. Your page is the storefront.",
  },
  {
    n: "3",
    title: "Start managing clients",
    body: "Take enquiries, add clients, and track progress from the same dashboard.",
  },
] as const;

const coachPoints = [
  "Manage clients from one dashboard",
  "Track health data and progress",
  "Capture and follow up on leads",
  "A public page that does the introducing",
] as const;

const memberPoints = [
  "Browse public coach profiles",
  "Filter by specialty and city",
  "Send a free enquiry when you are ready",
  "Check BMI, then talk to a coach",
] as const;

const stories = [
  {
    quote:
      "The public profile brings serious enquiries. Less chasing, more coaching.",
    name: "Rahul Mehta",
    role: "Fitness coach",
  },
  {
    quote:
      "Client notes and progress finally live in one place. Sessions feel sharper.",
    name: "Priya Sharma",
    role: "Personal trainer",
  },
  {
    quote:
      "People find the page, read the packages, and write. It works while I train.",
    name: "Ananya Iyer",
    role: "Nutrition coach",
  },
] as const;

const stats = [
  { value: "500+", label: "Coach profiles" },
  { value: "15+", label: "Coaching categories" },
  { value: "Free", label: "To browse and enquire" },
  { value: "1", label: "Place for the relationship" },
] as const;

export default async function HomePage() {
  let categories: { code: string; label: string }[] =
    FALLBACK_COACH_CATEGORIES.map((c) => ({ code: c.code, label: c.label }));
  let coaches: CoachPublicListItem[] = [];

  try {
    const [cats, listRes] = await Promise.all([
      fetchCoachCategories(),
      fetchPublicCoaches({ sortBy: "rating", page: 1, pageSize: 6 }),
    ]);
    if (cats.length > 0) categories = cats;
    if (isApiSuccess(listRes)) {
      coaches = listRes.responseObj?.items ?? [];
    }
  } catch {
    // Home still renders with fallback categories and an empty coach row.
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[image:var(--mc-gradient)] text-white">
        <div
          className="pointer-events-none absolute -top-32 -right-20 size-[32rem] rounded-full bg-white/6"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 -left-16 size-72 rounded-full bg-white/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[38%] right-[22%] size-40 rounded-full bg-[color:var(--mc-accent)]/20"
          aria-hidden
        />
        <div className="relative z-10 container grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div>
            <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 font-display text-sm font-bold text-[color:var(--mc-accent)]">
              India&apos;s coaching and wellness platform
            </p>
            <h1 className="mt-5 font-display text-[2.15rem] leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              Grow your
              <br />
              health coaching
              <br />
              <em className="font-extrabold text-[color:var(--mc-accent)] not-italic">
                business
              </em>
            </h1>
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-white/80 sm:text-base">
              Manage clients, track progress, and publish a coach page people
              can actually find. Built for personal trainers, nutrition coaches,
              and the people who train with them.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="mc-btn-primary w-full sm:w-auto"
              >
                Start as a Coach
              </Link>
              <Link
                href="/coach"
                className="mc-btn-outline-on-dark w-full sm:w-auto"
              >
                Find a Coach
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <div>
                <p className="font-display font-bold text-white">
                  Public profiles
                </p>
                <p className="text-white/80">Browse free, enquire when ready</p>
              </div>
              <span
                className="hidden h-9 w-px bg-white/20 sm:block"
                aria-hidden
              />
              <div>
                <p className="font-display font-bold text-[color:var(--mc-accent)]">
                  ★ ★ ★ ★ ★
                </p>
                <p className="text-white/80">Rated by the coaches who use it</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={photography.homeHero}
                alt="Coach spotting a squat in a neighbourhood gym"
                fill
                priority
                className="object-cover object-[30%_center]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </div>
            <div className="absolute -bottom-4 left-3 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:flex">
              <span className="grid size-11 place-items-center rounded-xl bg-[color:var(--mc-primary-light)] text-mc-primary">
                <Users className="size-5" aria-hidden />
              </span>
              <span>
                <strong className="block font-display text-sm">
                  Coaches on the directory
                </strong>
                <span className="text-xs text-ink-muted">
                  Growing a public practice
                </span>
              </span>
            </div>
            <div className="absolute -top-3 right-2 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:flex lg:-right-4">
              <span className="grid size-11 place-items-center rounded-xl bg-[color:var(--mc-secondary-light)] text-mc-secondary">
                <ChartLine className="size-5" aria-hidden />
              </span>
              <span>
                <strong className="block font-display text-sm">
                  Clients in one place
                </strong>
                <span className="text-xs text-ink-muted">
                  From enquiry to the next session
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 bg-paper">
        <div className="container -mt-7">
          <form
            action="/coach"
            className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_50px_rgba(44,24,16,0.12)] sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="hero-category">
              Category
            </label>
            <select
              id="hero-category"
              name="category"
              className="min-h-14 border-b border-line bg-transparent px-4 font-display text-sm font-medium text-ink sm:w-52 sm:border-r sm:border-b-0"
              defaultValue=""
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="hero-search">
              Search coaches
            </label>
            <input
              id="hero-search"
              name="search"
              type="search"
              placeholder="Search by name, specialty, or city"
              className="min-h-14 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              className="mc-btn-primary m-2 min-h-12 rounded-xl sm:rounded-full"
            >
              <Search className="size-4" aria-hidden />
              Search coaches
            </button>
          </form>
        </div>
      </div>

      <section className="bg-paper py-8">
        <div className="container">
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_8px_rgba(44,24,16,0.06)] lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="border-line px-5 py-5 lg:border-r lg:last:border-r-0 max-lg:[&:not(:nth-last-child(-n+2))]:border-b max-lg:[&:nth-child(odd)]:border-r"
              >
                <dt className="font-display text-2xl font-extrabold text-mc-secondary sm:text-3xl">
                  {item.value}
                </dt>
                <dd className="mt-1 text-sm text-ink-muted">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mc-section-tag">Explore categories</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Coaching for every goal
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              Strength, yoga, nutrition, or a broader wellness plan. Start with
              the specialty, then open a profile.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((item) => (
              <Link
                key={item.code}
                href={`/coach?category=${encodeURIComponent(item.code)}`}
                className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(44,24,16,0.05)] transition hover:-translate-y-1 hover:border-mc-primary/40 hover:shadow-[0_14px_36px_rgba(44,24,16,0.1)]"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-[color:var(--mc-secondary)]/10 font-display text-sm font-extrabold text-mc-secondary">
                  {item.label.slice(0, 1)}
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-ink">
                  {item.label}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Find coaches in this category
                </p>
                <span className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-mc-primary">
                  Browse
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[image:linear-gradient(160deg,#0c1a10_0%,#1b4332_55%,#163527_100%)] py-16 text-white sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex rounded-full border border-[color:var(--mc-accent)]/30 bg-[color:var(--mc-accent)]/15 px-4 py-1.5 font-display text-xs font-bold tracking-wide text-[color:var(--mc-accent)]">
              Platform features
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need to run the practice
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
              One place to manage clients, show your work, and take the next
              enquiry.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl bg-[#fdf8f2] p-6 text-ink transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_42px_rgba(0,0,0,0.18)]"
              >
                <span
                  className={`grid size-12 place-items-center rounded-xl ${item.tone}`}
                >
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">
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

      <section className="bg-paper py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mc-section-tag">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Start in three steps
            </h2>
          </div>
          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-[22px] border border-line bg-white p-7 shadow-[0_8px_24px_rgba(44,24,16,0.06)]"
              >
                <span className="grid size-12 place-items-center rounded-full bg-mc-primary font-display text-lg font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper-elevated py-16 sm:py-20">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mc-section-tag">Featured coaches</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Meet coaches on Mera Coach
              </h2>
            </div>
            <Link
              href="/coach"
              className="mc-btn-secondary min-h-11 px-5 text-sm"
            >
              Browse all coaches
            </Link>
          </div>
          {coaches.length > 0 ?
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {coaches.slice(0, 6).map((coach) => (
                <CoachDirectoryCard key={coach.coachId} coach={coach} />
              ))}
            </div>
          : <p className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-sm text-ink-muted">
              Coach profiles will show here as they go public. You can still
              browse the directory.
            </p>
          }
        </div>
      </section>

      <section className="bg-[#f5ede0] py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary/10 px-4 py-1.5 font-display text-xs font-bold text-mc-secondary">
              Who are you here for?
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Choose your path
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="relative flex min-h-[440px] overflow-hidden rounded-[22px] shadow-[0_10px_44px_rgba(0,0,0,0.14)]">
              <Image
                src={photography.homeFloor}
                alt="Coach and client talking between sets"
                fill
                className="object-cover object-right"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#0c1a10_0%,#1b4332_34%,rgba(27,67,50,0.72)_58%,transparent_100%)]"
                aria-hidden
              />
              <div className="relative z-10 flex min-h-[440px] w-full max-w-md flex-col justify-center p-7 text-white sm:p-9">
                <p className="w-fit rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/20 px-3 py-1 font-display text-[11px] font-bold text-[color:var(--mc-accent-light)]">
                  For coaches
                </p>
                <h3 className="mt-4 font-display text-2xl font-extrabold">
                  Built for coaches
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Run the practice from client notes to a page people can share.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/85">
                  {coachPoints.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        className="text-[color:var(--mc-accent)]"
                        aria-hidden
                      >
                        ●
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="mc-btn-primary mt-6 w-fit">
                  Start as a Coach
                </Link>
              </div>
            </article>
            <article className="relative flex min-h-[440px] overflow-hidden rounded-[22px] shadow-[0_10px_44px_rgba(0,0,0,0.14)]">
              <Image
                src={photography.pathMember}
                alt="A yoga practice in warm morning light"
                fill
                className="object-cover object-right"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#1a0e00_0%,#4a2800_34%,rgba(74,40,0,0.7)_58%,transparent_100%)]"
                aria-hidden
              />
              <div className="relative z-10 flex min-h-[440px] w-full max-w-md flex-col justify-center p-7 text-white sm:p-9">
                <p className="w-fit rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/20 px-3 py-1 font-display text-[11px] font-bold text-[#f3d7a1]">
                  For members
                </p>
                <h3 className="mt-4 font-display text-2xl font-extrabold">
                  Looking for a coach?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Compare specialties and cities, then send an enquiry.
                  Exploring is free.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/85">
                  {memberPoints.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        className="text-[color:var(--mc-accent)]"
                        aria-hidden
                      >
                        ●
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/coach"
                  className="mc-btn-outline-on-dark mt-6 w-fit"
                >
                  Find a Coach
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mc-section-tag">Coach stories</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              What coaches say
            </h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {stories.map((item) => (
              <blockquote
                key={item.name}
                className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
              >
                <p className="font-display text-4xl leading-none text-[color:var(--mc-accent)]">
                  “
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink">
                  {item.quote}
                </p>
                <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-mc-secondary font-display text-xs font-bold text-white">
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <span>
                    <strong className="block font-display text-sm text-ink">
                      {item.name}
                    </strong>
                    <span className="text-xs text-ink-muted">{item.role}</span>
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16 sm:pb-20">
        <div className="container">
          <div className="grid items-center gap-8 overflow-hidden rounded-[24px] bg-[image:linear-gradient(135deg,#1b4332,#0f2018)] p-7 text-white sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div>
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
                For coaches
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Grow your coaching
                <br />
                business with Mera Coach
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                Publish the profile, take enquiries, and keep clients, packages,
                and events together.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 font-display text-sm font-semibold text-mc-primary"
                >
                  Become a Coach
                </Link>
                <Link href="/services" className="mc-btn-outline-on-dark">
                  See the tools
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={photography.ctaPractice}
                alt="A notebook, kettlebell, and bottle on a coaching bench"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 36vw"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
