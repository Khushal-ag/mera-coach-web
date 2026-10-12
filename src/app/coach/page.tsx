import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

import type { CoachPublicListItem } from "@/types/coach";

import { PageHero } from "@/components/page-hero";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  fetchPublicCities,
  fetchPublicCoaches,
  firstApiError,
  isApiSuccess,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Find A Coach",
  description:
    "Meet expert health and wellness coaches on Mera Coach. Transform your life with world-class guidance.",
};

type SearchParams = Promise<{
  search?: string;
  city?: string;
  page?: string;
}>;

export default async function CoachDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  let coaches: CoachPublicListItem[] = [];
  let cities: string[] = [];
  let totalCount = 0;
  let totalPages = 1;
  let errorMessage: string | null = null;

  try {
    const [listRes, citiesRes] = await Promise.all([
      fetchPublicCoaches({
        search: params.search,
        city: params.city,
        page,
        pageSize: 12,
      }),
      fetchPublicCities(),
    ]);

    if (!isApiSuccess(listRes)) {
      errorMessage = firstApiError(listRes) ?? "Could not load coaches.";
    } else {
      coaches = listRes.responseObj?.items ?? [];
      totalCount = listRes.responseObj?.totalCount ?? coaches.length;
      totalPages = listRes.responseObj?.totalPages ?? 1;
    }

    if (isApiSuccess(citiesRes)) {
      cities = citiesRes.responseObj ?? [];
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load coaches.";
  }

  return (
    <>
      <PageHero
        className="text-center sm:text-center"
        title="Expert Coaches"
        subtitle="Browse public profiles for free. Transform your life with guidance from verified coaches."
      />

      <section className="bg-paper py-10 sm:py-14 lg:py-16">
        <div className="container grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-10 xl:grid-cols-[1fr_280px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Meet Our Coaches
                </h2>
                <div className="mt-2 h-1 w-14 bg-mc-brand-coach" aria-hidden />
              </div>
              <form
                className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
                action="/coach"
              >
                <input
                  type="search"
                  name="search"
                  defaultValue={params.search ?? ""}
                  placeholder="Search coaches…"
                  aria-label="Search coaches"
                  className="mc-field min-h-11 flex-1 rounded-full px-4"
                />
                {params.city ?
                  <input type="hidden" name="city" value={params.city} />
                : null}
                <button
                  type="submit"
                  className="mc-btn-primary min-h-11 w-full px-5 text-sm sm:w-auto"
                >
                  Search
                </button>
              </form>
            </div>

            {cities.length > 0 ?
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={
                    params.search ?
                      `/coach?search=${encodeURIComponent(params.search)}`
                    : "/coach"
                  }
                  className={
                    !params.city ? "mc-chip min-h-11" : (
                      "inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3 text-xs font-bold text-ink-muted"
                    )
                  }
                >
                  All cities
                </Link>
                {cities.slice(0, 16).map((city) => {
                  const href = new URLSearchParams();
                  if (params.search) href.set("search", params.search);
                  href.set("city", city);
                  const active = params.city === city;
                  return (
                    <Link
                      key={city}
                      href={`/coach?${href.toString()}`}
                      className={
                        active ? "mc-chip min-h-11" : (
                          "inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-3 text-xs font-bold text-ink-muted hover:border-mc-secondary"
                        )
                      }
                    >
                      {city}
                    </Link>
                  );
                })}
              </div>
            : null}

            {errorMessage ?
              <AlertBanner tone="error" className="mt-8">
                {errorMessage} Set{" "}
                <code className="font-mono text-xs">
                  NEXT_PUBLIC_API_BASE_URL
                </code>{" "}
                and try again.
              </AlertBanner>
            : coaches.length === 0 ?
              <AlertBanner tone="info" className="mt-8">
                No coaches found yet. Coaches who complete registration and make
                their profile public will appear here.
              </AlertBanner>
            : <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {coaches.map((coach) => (
                  <CoachCard key={coach.coachId} coach={coach} />
                ))}
              </div>
            }

            {totalPages > 1 ?
              <div className="mt-8 flex flex-col gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Page {page} of {totalPages} · {totalCount} coaches
                </p>
                <div className="flex flex-wrap gap-2">
                  {page > 1 ?
                    <Link
                      href={pageHref(params, page - 1)}
                      className="mc-btn-secondary min-h-11 flex-1 px-4 text-xs sm:flex-none"
                    >
                      Previous
                    </Link>
                  : null}
                  {page < totalPages ?
                    <Link
                      href={pageHref(params, page + 1)}
                      className="mc-btn-primary min-h-11 flex-1 px-4 text-xs sm:flex-none"
                    >
                      Next
                    </Link>
                  : null}
                </div>
              </div>
            : null}
          </div>

          <aside className="space-y-6">
            <div className="mc-card p-5">
              <h3 className="font-display text-lg font-bold">
                Looking for a coach?
              </h3>
              <p className="mt-2 text-sm text-ink-muted">
                Browse profiles, compare specialties, and send an enquiry from a
                coach page. Exploring coaches is free.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex text-sm font-semibold text-mc-brand-coach"
              >
                Are you a coach? Join us
              </Link>
            </div>
            <div className="mc-gradient-header rounded-2xl p-5 text-white">
              <h3 className="font-display text-lg font-bold">
                Popular focus areas
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                {[
                  "Weight Loss",
                  "Weight Gain",
                  "Dietitian",
                  "Yoga",
                  "Strength",
                  "Nutrition",
                ].map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function pageHref(params: { search?: string; city?: string }, page: number) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.city) q.set("city", params.city);
  q.set("page", String(page));
  return `/coach?${q.toString()}`;
}

function CoachCard({ coach }: { coach: CoachPublicListItem }) {
  const href =
    coach.coachCode ?
      `/coach/${encodeURIComponent(coach.coachCode)}`
    : `/coach/${coach.coachId}`;
  const photo = coach.profile_Pic_Url?.trim() || "/mc-images/services-1.jpg";

  return (
    <article className="mc-card">
      <div className="relative aspect-[16/10] bg-line">
        <Image
          src={photo}
          alt={coach.coachName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 40vw"
          unoptimized={photo.startsWith("http")}
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-ink">
          {coach.coachName}
        </h3>
        <p className="mt-1 text-sm text-mc-secondary">
          {coach.coachTypeName || "Health Coach"}
          {coach.city_Cd ? ` · ${coach.city_Cd}` : ""}
        </p>
        {coach.tagline ?
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
            {coach.tagline}
          </p>
        : null}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">
            {coach.rating > 0 ?
              `★ ${coach.rating.toFixed(1)} (${coach.reviewCount})`
            : "New coach"}
          </p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-mc-brand-coach px-4 text-xs font-bold text-white hover:brightness-105"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
