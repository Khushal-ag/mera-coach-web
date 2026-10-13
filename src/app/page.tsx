import Image from "next/image";
import Link from "next/link";

import { ArrowRight, MapPin, MessagesSquare, Users } from "lucide-react";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachDirectoryCard } from "@/components/coach-directory-card";
import { HomeCoachSearch } from "@/components/home-coach-search";
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

const specialties = [
  {
    title: "Fitness",
    body: "Gym floors, personal training, and strength plans.",
    image: photography.bannerFitness,
    alt: "A coach working with a client on a gym floor",
    needles: ["gym", "fitness", "personal", "weight", "zumba"],
  },
  {
    title: "Yoga",
    body: "Studios and one-to-one practice you can keep.",
    image: photography.bannerYoga,
    alt: "A yoga session in warm morning light",
    needles: ["yoga"],
  },
  {
    title: "Nutrition",
    body: "Meals and habits that fit a real week.",
    image: photography.bannerNutrition,
    alt: "A nutrition consult with food on the table",
    needles: ["nutri", "diet", "lifestyle"],
  },
  {
    title: "Wellness",
    body: "Health coaching across the whole routine.",
    image: photography.bannerWellness,
    alt: "A wellness conversation between coach and client",
    needles: ["well", "health", "holistic"],
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Search the directory",
    body: "Pick a specialty, a city, or a name. Public profiles are open to browse.",
  },
  {
    n: "02",
    title: "Read the practice",
    body: "Packages, events, and a short story sit on one page.",
  },
  {
    n: "03",
    title: "Send an enquiry",
    body: "Write when you are ready. Exploring the directory is free.",
  },
] as const;

const memberPoints = [
  {
    icon: MapPin,
    title: "Specialty and city",
    body: "Start from what you need, then narrow to coaches near you.",
  },
  {
    icon: Users,
    title: "A public profile",
    body: "See how they work before you write. No account required to look.",
  },
  {
    icon: MessagesSquare,
    title: "A free enquiry",
    body: "Ask about a package or a first session from the profile.",
  },
] as const;

const coachPoints = [
  "Clients, check-ups, and history in one list",
  "Leads from the public page, ready to follow up",
  "Packages and events without a second website",
] as const;

function specialtyHref(
  categories: { code: string; label: string }[],
  needles: readonly string[],
) {
  const match = categories.find((item) =>
    needles.some((needle) => item.label.toLowerCase().includes(needle)),
  );
  return match ? `/coach?category=${encodeURIComponent(match.code)}` : "/coach";
}

export default async function HomePage() {
  let categories: { code: string; label: string }[] =
    FALLBACK_COACH_CATEGORIES.map((item) => ({
      code: item.code,
      label: item.label,
    }));
  let coaches: CoachPublicListItem[] = [];

  try {
    const [cats, listRes] = await Promise.all([
      fetchCoachCategories(),
      fetchPublicCoaches({ sortBy: "rating", page: 1, pageSize: 3 }),
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
      <section className="relative bg-[image:var(--mc-gradient)] text-white">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -top-24 -right-16 size-[28rem] rounded-full bg-white/8" />
          <div className="absolute bottom-10 -left-20 size-72 rounded-full bg-[color:var(--mc-brand-coach)]/20" />
        </div>
        <div className="relative z-10 container grid gap-6 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-x-10 lg:gap-y-8 lg:py-8">
          <div className="mc-enter max-w-xl lg:col-start-1 lg:row-start-1">
            <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-display text-xs font-bold tracking-wide text-mc-brand-coach">
              India&apos;s coaching platform
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">
              Find a coach.
              <span className="mt-1 block text-mc-brand-coach">
                Or run the practice.
              </span>
            </h1>
            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-white/80 sm:text-base">
              Search by specialty and city, then send a free enquiry. Coaches
              keep clients and a public page together.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#hero-search"
                className="mc-btn-primary mc-btn-hero w-full sm:w-auto"
              >
                Find a coach
              </a>
              <Link
                href="/register"
                className="mc-btn-outline-on-dark w-full sm:w-auto"
              >
                Start as a coach
              </Link>
            </div>
          </div>
          <div
            className="mc-enter relative z-20 lg:col-span-2 lg:row-start-2"
            style={{ animationDelay: "160ms" }}
          >
            <HomeCoachSearch categories={categories} />
          </div>
          <div
            className="mc-enter relative mx-auto w-full max-w-lg lg:col-start-2 lg:row-start-1 lg:max-w-none"
            style={{ animationDelay: "90ms" }}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] shadow-[0_28px_70px_rgba(0,0,0,0.32)] lg:max-h-[22rem]">
              <Image
                src={photography.homeHero}
                alt="Coach spotting a squat in a neighbourhood gym"
                fill
                priority
                className="object-cover object-[center_30%]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container">
          <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Start with the kind of coaching you want
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Four ways in. Each opens the directory already filtered.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialties.map((item) => (
              <Link
                key={item.title}
                href={specialtyHref(categories, item.needles)}
                className="group overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_8px_24px_rgba(23,134,118,0.06)] transition motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_40px_rgba(23,134,118,0.12)]"
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover transition duration-500 motion-safe:group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </span>
                <span className="block p-4">
                  <span className="font-display text-lg font-bold text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </span>
                  <span className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-mc-secondary">
                    Browse
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--mc-explore-canvas)] py-16 sm:py-20">
        <div className="container">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            How finding a coach works
          </h2>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-[20px] border border-line bg-white p-6 shadow-[0_8px_24px_rgba(23,134,118,0.05)]"
              >
                <span className="font-display text-3xl font-extrabold text-mc-secondary">
                  {step.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">
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

      <section className="bg-paper py-16 sm:py-20">
        <div className="container grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_18px_50px_rgba(23,134,118,0.12)]">
            <Image
              src={photography.pathMember}
              alt="Someone arriving for a coaching session"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Looking for a coach
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              Compare public profiles, then write when a practice feels like a
              fit. You do not need an account to browse.
            </p>
            <ul className="mt-6 space-y-4">
              {memberPoints.map((point) => (
                <li key={point.title} className="flex gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mc-secondary-light text-mc-secondary">
                    <point.icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-sm font-bold text-ink">
                      {point.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">
                      {point.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/coach" className="mc-btn-primary mt-6 w-fit">
              Find a coach
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mc-secondary-light py-16 sm:py-20">
        <div className="container grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Built for coaches
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              The public page introduces you. The dashboard holds the clients,
              leads, and the next session.
            </p>
            <ul className="mt-6 space-y-3">
              {coachPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-ink shadow-[0_6px_18px_rgba(23,134,118,0.06)]"
                >
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full bg-mc-primary"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mc-btn-primary mt-6 w-fit">
              Start as a coach
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_18px_50px_rgba(23,134,118,0.14)]">
            <Image
              src={photography.homeFloor}
              alt="Coach and client talking between sets"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Coaches on the directory
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
                Open a profile to see the city, the specialty, and how to
                enquire.
              </p>
            </div>
            <Link
              href="/coach"
              className="mc-btn-secondary min-h-11 px-5 text-sm"
            >
              Find a coach
            </Link>
          </div>
          {coaches.length > 0 ?
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {coaches.map((coach) => (
                <CoachDirectoryCard key={coach.coachId} coach={coach} />
              ))}
            </div>
          : <div className="mt-8 rounded-[20px] border border-dashed border-line bg-white px-6 py-10">
              <p className="font-display text-lg font-bold text-ink">
                Profiles appear here as coaches go public
              </p>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted">
                The directory is still the place to look. Search by specialty or
                city, or open a practice of your own.
              </p>
            </div>
          }
        </div>
      </section>

      <section className="bg-paper pb-16 sm:pb-20">
        <div className="container">
          <div className="grid items-center gap-8 overflow-hidden rounded-[24px] bg-[image:var(--mc-tips-gradient)] p-7 text-white sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Open your practice on Mera Coach
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                Publish the profile, take enquiries, and keep the client list in
                the same account.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="mc-btn-primary mc-btn-hero w-full sm:w-auto"
                >
                  Start as a coach
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
