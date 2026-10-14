import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  BarChart3,
  Check,
  Filter,
  Globe,
  LayoutDashboard,
  Search,
  Star,
  Users,
} from "lucide-react";

import { BmiCalculator } from "@/components/bmi-calculator";
import {
  FeaturedCoaches,
  FeaturedCoachesFallback,
} from "@/components/home/featured-coaches";
import { MenuSelect } from "@/components/ui/menu-select";
import { photography } from "@/config/photography";
import { siteConfig } from "@/config/site";
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
    body: "Keep profiles, check-ups, and history in one list so the next session is easy to pick up.",
    icon: Users,
    tone: "bg-mc-secondary-light text-mc-secondary",
  },
  {
    title: "Progress tracking",
    body: "Record BMI, weight, and measurements over time, then share a report with the client.",
    icon: BarChart3,
    tone: "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
  },
  {
    title: "Lead management",
    body: "Enquiries from the public page land in the dashboard so a new client is not lost in a chat thread.",
    icon: Filter,
    tone: "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
  },
  {
    title: "Public page",
    body: "Each coach gets a page with their photo, services, and a way to enquire. Share the link.",
    icon: Globe,
    tone: "bg-mc-secondary-light text-mc-secondary",
  },
  {
    title: "Packages and events",
    body: "List what you offer and upcoming sessions on the same page people use to find you.",
    icon: Star,
    tone: "bg-mc-primary-light text-mc-primary",
  },
  {
    title: "Your practice brand",
    body: "Name, story, and specialties sit on one profile so the practice is easy to recognise.",
    icon: LayoutDashboard,
    tone: "bg-mc-primary-light text-mc-primary",
  },
] as const;

const steps = [
  {
    n: "1",
    title: "Sign up as a coach",
    body: "Create the account, choose a category, and join the public directory.",
  },
  {
    n: "2",
    title: "Set up your profile and services",
    body: "Add a photo, a short story, and the services people should enquire about.",
  },
  {
    n: "3",
    title: "Start managing clients",
    body: "Take enquiries, add clients, and keep check-ups in the same dashboard.",
  },
] as const;

const coachPath = [
  "Manage clients from one dashboard",
  "Track health data and check-ups",
  "Capture enquiries from the public page",
  "Publish packages and events",
] as const;

const memberPath = [
  "Browse public coach profiles",
  "Filter by category and city",
  "Read how a coach works before you write",
  "Send an enquiry without an account",
] as const;

const tips = [
  {
    title: "Start with a number you can explain",
    body: "BMI is a baseline, not a diagnosis. Use it to start a conversation with a coach.",
    image: photography.bannerNutrition,
    alt: "A meal laid out for a nutrition consult",
    href: "/bmi",
    label: "Check BMI",
  },
  {
    title: "Match the coach to the goal",
    body: "Yoga, strength, and nutrition are different practices. Filter the directory before you enquire.",
    image: photography.bannerYoga,
    alt: "A yoga session in warm light",
    href: "/coach",
    label: "Find a coach",
  },
  {
    title: "A plan only works if it fits the week",
    body: "Look for a coach who describes how they adjust training and meals around real schedules.",
    image: photography.bannerFitness,
    alt: "A coach working with a client on a gym floor",
    href: "/services",
    label: "See the tools",
  },
] as const;

const appPoints = [
  "Book and manage sessions on the go",
  "Keep BMI, weight, and check-ups together",
  "Hear back from your coach in one place",
] as const;

export default function HomePage() {
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-[image:var(--mc-gradient)] text-white"
      >
        <div
          className="pointer-events-none absolute -top-32 -right-20 size-[32rem] rounded-full bg-white/6"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[18%] size-40 rounded-full bg-[color:var(--mc-accent)]/20"
          aria-hidden
        />
        <div className="relative z-10 container grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-display text-xs font-bold tracking-wide text-[color:var(--mc-accent)]">
              <span
                className="size-2 rounded-full bg-[color:var(--mc-accent)]"
                aria-hidden
              />
              Coach management platform
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Grow Your
              <br />
              Health Coaching
              <br />
              <em className="text-[color:var(--mc-accent)] not-italic">
                Business
              </em>
            </h1>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-white/80">
              Manage clients, track progress, and publish a coaching page.
              People looking for a coach can browse the directory and send an
              enquiry.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="mc-btn-primary mc-btn-hero w-full sm:w-auto"
              >
                Start as a Coach
              </Link>
              <Link href="/coach" className="mc-btn-outline-on-dark">
                <Search className="size-4" aria-hidden />
                Find a Coach
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:aspect-[5/4]">
              <Image
                src={photography.homeHero}
                alt="Coach spotting a squat in a neighbourhood gym"
                fill
                priority
                className="object-cover object-[center_30%]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:absolute sm:inset-x-0 sm:top-auto sm:bottom-6 sm:mt-0 sm:grid-cols-2 sm:px-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_40px_rgba(44,24,16,0.16)]">
                <span className="grid size-11 place-items-center rounded-xl bg-mc-primary-light text-mc-primary">
                  <Users className="size-5" aria-hidden />
                </span>
                <span>
                  <strong className="block font-display text-sm">
                    Public profiles
                  </strong>
                  <span className="text-xs text-ink-muted">Open to browse</span>
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink shadow-[0_16px_40px_rgba(44,24,16,0.16)] sm:translate-y-8">
                <span className="grid size-11 place-items-center rounded-xl bg-mc-secondary-light text-mc-secondary">
                  <BarChart3 className="size-5" aria-hidden />
                </span>
                <span>
                  <strong className="block font-display text-sm">
                    Client tools
                  </strong>
                  <span className="text-xs text-ink-muted">
                    In one dashboard
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-paper">
        <div className="container">
          <form
            action="/coach"
            className="relative z-20 mx-auto -mt-7 flex max-w-4xl flex-col rounded-2xl border border-line bg-white shadow-[0_20px_60px_rgba(44,24,16,0.12)] sm:flex-row"
          >
            <label
              id="hero-category-label"
              className="sr-only"
              htmlFor="hero-category"
            >
              Category
            </label>
            <MenuSelect
              id="hero-category"
              name="category"
              aria-labelledby="hero-category-label"
              variant="bar"
              defaultValue=""
              className="sm:w-52 sm:shrink-0"
              options={[
                { value: "", label: "All categories" },
                ...FALLBACK_COACH_CATEGORIES.map((item) => ({
                  value: item.code,
                  label: item.label,
                })),
              ]}
            />
            <label className="sr-only" htmlFor="hero-search">
              Search coaches
            </label>
            <input
              id="hero-search"
              name="search"
              type="search"
              placeholder="Search by name, specialty, city, or goal"
              className="min-h-14 w-full min-w-0 flex-1 appearance-none border-0 bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              className="mc-btn-primary m-2 min-h-12 rounded-xl sm:rounded-full"
            >
              <Search className="size-4" aria-hidden />
              Search Coaches
            </button>
          </form>
        </div>
      </div>

      <section className="bg-paper py-10">
        <div className="container grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-4">
          {[
            ["Profiles", "Public coach pages"],
            ["Tools", "Clients and leads"],
            ["Enquiries", "Free to send"],
            ["BMI", "Check in seconds"],
          ].map(([title, label]) => (
            <div key={title} className="text-center">
              <p className="font-display text-2xl font-extrabold text-[color:var(--mc-accent)] sm:text-3xl">
                {title}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="categories" className="bg-paper pb-16 sm:pb-20">
        <div className="container">
          <Intro
            tag="Explore categories"
            title="Coaching for every goal"
            subtitle="Pick a specialty. The directory opens already filtered."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FALLBACK_COACH_CATEGORIES.map((item) => (
              <Link
                key={item.code}
                href={`/coach?category=${encodeURIComponent(item.code)}`}
                className="rounded-[18px] border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.05)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(44,24,16,0.1)]"
              >
                <h3 className="font-display text-base font-bold text-ink">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm font-semibold text-mc-primary">
                  Find coaches
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[image:var(--mc-gradient)] py-16 text-white sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex rounded-full border border-[color:var(--mc-accent)]/35 bg-[color:var(--mc-accent)]/15 px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
              Platform features
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Everything you need to run your coaching practice
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
              One place for the public page, the client list, and the next
              enquiry.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/15 bg-paper p-6 text-ink"
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
          <Intro
            tag="How it works"
            title="Start your coaching journey in 3 simple steps"
            subtitle="From sign-up to a public page and a client list."
          />
          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-[20px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
              >
                <span className="grid size-12 place-items-center rounded-full bg-mc-secondary font-display text-lg font-extrabold text-white">
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

      <Suspense fallback={<FeaturedCoachesFallback />}>
        <FeaturedCoaches />
      </Suspense>

      <section
        id="path"
        className="bg-[color:var(--paper-elevated)] py-16 sm:py-20"
      >
        <div className="container">
          <Intro
            tag="Who are you here for?"
            title="Choose your path"
            subtitle="Mera Coach is for coaches running a practice and for people looking for one."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <PathPanel
              image={photography.homeFloor}
              alt="Coach and client talking between sets"
              eyebrow="For coaches"
              title="Built for coaches"
              body="Run the practice from a public page and a client dashboard."
              points={coachPath}
              href="/register"
              cta="Start as a Coach"
              tone="forest"
            />
            <PathPanel
              image={photography.pathMember}
              alt="Someone arriving for a coaching session"
              eyebrow="For members"
              title="Looking for a coach?"
              body="Find a public profile, then write when the practice feels like a fit."
              points={memberPath}
              href="/coach"
              cta="Find a Coach"
              tone="amber"
            />
          </div>
        </div>
      </section>

      <section id="bmi" className="bg-paper py-16 sm:py-20">
        <div className="container grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full bg-[color:var(--mc-accent-light)] px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
              Free health tool
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Know your BMI,
              <br />
              know your health
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              A quick check, then share your name and mobile if you want a coach
              to call you back. Nothing is stored until you ask.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              {[
                "Instant BMI with a health category",
                "Suggestions stay on this page",
                "Optional callback, no account required",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-mc-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <BmiCalculator layout="stack" />
        </div>
      </section>

      <section
        id="tips"
        className="bg-[color:var(--paper-elevated)] py-16 sm:py-20"
      >
        <div className="container">
          <Intro
            tag="Wellness notes"
            title="Tips, insights and wellness wisdom"
            subtitle="Short starting points. There is no article library yet, so these link into the tools."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tips.map((tip) => (
              <article
                key={tip.title}
                className="overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={tip.image}
                    alt={tip.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-ink">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {tip.body}
                  </p>
                  <Link
                    href={tip.href}
                    className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary"
                  >
                    {tip.label}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary-light px-3 py-1 font-display text-xs font-bold text-mc-secondary">
              Mobile app
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Your wellness journey, now in your pocket
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
              The Mera Coach app is where members follow a plan with their
              coach. Store listings are not live on this page yet.
            </p>
            <ul className="mt-6 space-y-3">
              {appPoints.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-ink">
                  <Check className="mt-0.5 size-4 shrink-0 text-mc-secondary" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-semibold text-ink-muted">
              Launching soon on Google Play and the App Store.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[16rem] rounded-[2rem] border-8 border-mc-secondary bg-white p-4 shadow-[0_24px_60px_rgba(27,67,50,0.2)]">
            <p className="font-display text-sm font-bold text-mc-secondary">
              Mera Coach
            </p>
            <div className="mt-4 rounded-2xl bg-mc-secondary p-4 text-white">
              <p className="text-xs text-white/70">Today</p>
              <p className="mt-1 font-display text-lg font-bold">Your plan</p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              <li className="rounded-xl bg-paper px-3 py-2">Next check-up</li>
              <li className="rounded-xl bg-paper px-3 py-2">BMI log</li>
              <li className="rounded-xl bg-paper px-3 py-2">
                Message your coach
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-paper pb-16 sm:pb-20">
        <div className="container">
          <div className="grid items-center gap-8 overflow-hidden rounded-[28px] bg-[image:var(--mc-gradient)] p-7 text-white sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <p className="inline-flex rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/15 px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
                For coaches
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Grow your coaching business with Mera Coach
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                Publish the profile, take enquiries, and keep the client list in
                the same account.
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  "Public landing page",
                  "Client dashboard",
                  "BMI and check-up tools",
                  "Enquiry inbox",
                ].map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-[color:var(--mc-accent)]" />
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="mc-btn-primary w-full bg-white text-mc-secondary sm:w-auto"
                >
                  Become a Coach
                </Link>
                <Link href="/services" className="mc-btn-outline-on-dark">
                  Learn more
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

function Intro({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary-light px-3 py-1 font-display text-xs font-bold tracking-wide text-mc-secondary">
        {tag}
      </p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function PathPanel({
  image,
  alt,
  eyebrow,
  title,
  body,
  points,
  href,
  cta,
  tone,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  points: readonly string[];
  href: string;
  cta: string;
  tone: "forest" | "amber";
}) {
  const scrim =
    tone === "forest" ?
      "bg-[linear-gradient(90deg,#0c1a10_0%,#1b4332_42%,rgba(27,67,50,0.55)_68%,transparent_100%)]"
    : "bg-[linear-gradient(90deg,#1a0e00_0%,#4a2800_42%,rgba(74,40,0,0.5)_68%,transparent_100%)]";
  return (
    <article className="relative min-h-[28rem] overflow-hidden rounded-[22px] shadow-[0_10px_44px_rgba(0,0,0,0.14)]">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover object-right"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className={`absolute inset-0 ${scrim}`} aria-hidden />
      <div className="relative z-10 flex h-full max-w-md flex-col justify-center p-7 text-white sm:p-9">
        <p
          className={
            tone === "forest" ?
              "w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 font-display text-[11px] font-bold text-white"
            : "w-fit rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/20 px-3 py-1 font-display text-[11px] font-bold text-[color:var(--mc-accent)]"
          }
        >
          {eyebrow}
        </p>
        <h3 className="mt-4 font-display text-2xl font-extrabold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
        <ul className="mt-4 space-y-2">
          {points.map((point) => (
            <li key={point} className="flex gap-2 text-sm text-white/85">
              <Check className="mt-0.5 size-4 shrink-0 text-[color:var(--mc-accent)]" />
              {point}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className={
            tone === "forest" ?
              "mc-btn-primary mc-btn-hero mt-6 w-fit"
            : "mc-btn-outline-on-dark mt-6 w-fit"
          }
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
