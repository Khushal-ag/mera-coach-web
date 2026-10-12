import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { MapPin, Star } from "lucide-react";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { AlertBanner } from "@/components/ui/alert-banner";
import { photography } from "@/config/photography";
import {
  fetchCoachCategories,
  fetchPublicCities,
  fetchPublicCoaches,
  firstApiError,
  isApiSuccess,
} from "@/lib/api";
import {
  coachPublicMinRatingParam,
  coachPublicSortParam,
  FALLBACK_COACH_CATEGORIES,
  RATING_FILTER_OPTIONS,
  shortCategoryLabel,
  SORT_OPTIONS,
} from "@/lib/coach/directory";
import { resolveCoachPhotoUrl } from "@/lib/media/media-url";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Find A Coach",
  description:
    "Find your personal coach on Mera Coach. Browse public profiles, compare specialties, and send an enquiry.",
  path: "/coach",
});

type SearchParams = Promise<{
  search?: string;
  city?: string;
  category?: string;
  rating?: string;
  sort?: string;
  page?: string;
}>;

type DirectoryParams = {
  search?: string;
  city?: string;
  category?: string;
  rating?: string;
  sort?: string;
};

function buildQuery(params: DirectoryParams, page?: number) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.city) q.set("city", params.city);
  if (params.category) q.set("category", params.category);
  if (params.rating && params.rating !== RATING_FILTER_OPTIONS[0])
    q.set("rating", params.rating);
  if (params.sort && params.sort !== SORT_OPTIONS[0])
    q.set("sort", params.sort);
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/coach?${s}` : "/coach";
}

export default function CoachDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <section className="bg-paper">
        <div className="container grid items-center gap-8 py-10 sm:py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:py-14">
          <div>
            <h1 className="max-w-[10em] font-display text-4xl leading-[1.08] font-bold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
              Find your coach
            </h1>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-muted sm:text-base">
              Browse public profiles free. Compare specialties and enquire when
              you are ready to train.
            </p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)]">
            <Image
              src={photography.findCoach}
              alt="Coach and client reviewing a training plan"
              fill
              priority
              className="object-cover object-[center_40%]"
              sizes="(max-width: 1024px) 100vw, 56vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--mc-explore-canvas)] py-12 sm:py-16 lg:py-20">
        <div className="container">
          <Suspense fallback={<DirectoryFallback />}>
            <CoachDirectoryBody searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function CoachDirectoryBody({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.search?.trim() || undefined;
  const city = params.city?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const ratingLabel =
    RATING_FILTER_OPTIONS.find((r) => r === params.rating) ??
    RATING_FILTER_OPTIONS[0];
  const sortLabel =
    SORT_OPTIONS.find((s) => s === params.sort) ?? SORT_OPTIONS[0];
  const minRating = coachPublicMinRatingParam(ratingLabel);
  const sortBy = coachPublicSortParam(sortLabel);

  const dirParams: DirectoryParams = {
    search,
    city,
    category,
    rating: ratingLabel,
    sort: sortLabel,
  };

  let coaches: CoachPublicListItem[] = [];
  let topRated: CoachPublicListItem[] = [];
  let cities: string[] = [];
  let categories: { code: string; label: string }[] =
    FALLBACK_COACH_CATEGORIES.map((c) => ({
      code: c.code,
      label: c.label,
    }));
  let totalCount = 0;
  let totalPages = 1;
  let errorMessage: string | null = null;

  try {
    const [listRes, citiesRes, cats, topRes] = await Promise.all([
      fetchPublicCoaches({
        search,
        city,
        coachTypeCode: category,
        minRating,
        sortBy,
        page,
        pageSize: 10,
      }),
      fetchPublicCities({ coachTypeCode: category }),
      fetchCoachCategories(),
      fetchPublicCoaches({ sortBy: "rating", page: 1, pageSize: 6 }),
    ]);

    if (cats.length > 0) categories = cats;

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

    if (isApiSuccess(topRes)) {
      topRated = (topRes.responseObj?.items ?? [])
        .filter((c) => c.rating > 0)
        .slice(0, 6);
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load coaches.";
  }

  const categoryLabel =
    categories.find((c) => c.code === category)?.label ?? "All categories";
  const hasFilters = !!(
    search ||
    city ||
    category ||
    ratingLabel !== RATING_FILTER_OPTIONS[0] ||
    sortLabel !== SORT_OPTIONS[0]
  );

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Coaches ready to train with you
          </h2>
          <div
            className="mt-2.5 h-1 w-14 rounded-full bg-mc-brand-coach"
            aria-hidden
          />
        </div>
        <form
          className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-stretch"
          action="/coach"
        >
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by name or specialty…"
            aria-label="Search coaches"
            className="mc-field min-h-11 flex-1"
          />
          {city ?
            <input type="hidden" name="city" value={city} />
          : null}
          {category ?
            <input type="hidden" name="category" value={category} />
          : null}
          {ratingLabel !== RATING_FILTER_OPTIONS[0] ?
            <input type="hidden" name="rating" value={ratingLabel} />
          : null}
          {sortLabel !== SORT_OPTIONS[0] ?
            <input type="hidden" name="sort" value={sortLabel} />
          : null}
          <button
            type="submit"
            className="mc-btn-primary min-h-11 w-full shrink-0 px-6 text-sm sm:w-auto"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter row — city / category / rating / sort */}
      <form
        action="/coach"
        className="mt-6 grid gap-3 border-y border-line bg-surface/80 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4"
      >
        {search ?
          <input type="hidden" name="search" value={search} />
        : null}
        <label className="block text-xs font-semibold text-ink-muted">
          Serving city
          <select
            name="city"
            defaultValue={city ?? ""}
            className="mc-field mt-1.5 min-h-11 w-full rounded-[10px] px-3 text-sm text-ink"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-ink-muted">
          Category
          <select
            name="category"
            defaultValue={category ?? ""}
            className="mc-field mt-1.5 min-h-11 w-full rounded-[10px] px-3 text-sm text-ink"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {shortCategoryLabel(c.label)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-ink-muted">
          Rating
          <select
            name="rating"
            defaultValue={ratingLabel}
            className="mc-field mt-1.5 min-h-11 w-full rounded-[10px] px-3 text-sm text-ink"
          >
            {RATING_FILTER_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold text-ink-muted">
          Sort by
          <select
            name="sort"
            defaultValue={sortLabel}
            className="mc-field mt-1.5 min-h-11 w-full rounded-[10px] px-3 text-sm text-ink"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="mc-btn-primary min-h-11 px-5 text-sm"
          >
            Apply filters
          </button>
          {hasFilters ?
            <Link
              href="/coach"
              className="mc-btn-secondary min-h-11 px-5 text-sm"
            >
              Clear filters
            </Link>
          : null}
          <p className="ms-auto text-xs text-ink-muted">
            {[
              category ? shortCategoryLabel(categoryLabel) : "All categories",
              city || null,
              ratingLabel !== RATING_FILTER_OPTIONS[0] ? ratingLabel : null,
              sortLabel,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </form>

      {!hasFilters && topRated.length > 0 ?
        <section className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold text-ink">
              Top rated
            </h3>
            <Link
              href={buildQuery({ sort: "Top Rated" })}
              className="text-xs font-semibold text-mc-secondary"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {topRated.map((coach) => (
              <TopRatedCard key={coach.coachId} coach={coach} />
            ))}
          </div>
        </section>
      : null}

      {errorMessage ?
        <AlertBanner tone="error" className="mt-8">
          We could not load coaches right now. Please refresh and try again.
        </AlertBanner>
      : coaches.length === 0 ?
        <div className="mt-10 max-w-xl border-t border-[color:var(--mc-secondary)]/15 pt-8">
          <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
            No coaches match yet
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Try another city, category, or keyword. New personal trainers go
            public as they join.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-mc-brand-coach"
          >
            Are you a coach? Start here
          </Link>
        </div>
      : <div className="mt-8 space-y-4">
          {coaches.map((coach) => (
            <CoachResultCard key={coach.coachId} coach={coach} />
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
                href={buildQuery(dirParams, page - 1)}
                className="mc-btn-secondary min-h-11 flex-1 px-4 text-xs sm:flex-none"
              >
                Previous
              </Link>
            : null}
            {page < totalPages ?
              <Link
                href={buildQuery(dirParams, page + 1)}
                className="mc-btn-primary min-h-11 flex-1 px-4 text-xs sm:flex-none"
              >
                Next
              </Link>
            : null}
          </div>
        </div>
      : null}

      <aside className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Looking for a personal trainer?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Browse profiles, compare specialties, and enquire from a coach page.
            Exploring is free.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-brand-coach"
          >
            Are you a coach? Start here
          </Link>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Check your BMI
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Get your BMI in seconds, then share your details so a coach can call
            you back.
          </p>
          <Link
            href="/bmi"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-brand-coach"
          >
            Open BMI calculator
          </Link>
        </div>
      </aside>
    </div>
  );
}

function DirectoryFallback() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading coaches">
      <div className="h-8 w-48 animate-pulse rounded bg-line" />
      <div className="mt-6 h-28 animate-pulse rounded-[var(--radius-md)] bg-line" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-4"
          >
            <div className="size-20 shrink-0 animate-pulse rounded-full bg-line sm:size-[5.5rem]" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-line" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-line" />
              <div className="h-4 w-full animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachResultCard({ coach }: { coach: CoachPublicListItem }) {
  const href =
    coach.coachCode ?
      `/coach/${encodeURIComponent(coach.coachCode)}`
    : `/coach/${coach.coachId}`;
  const photo = resolveCoachPhotoUrl(coach);
  const tags = (coach.serviceNames || coach.serviceCodes_Csv || "")
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);
  const showRating = coach.rating > 0 && coach.reviewCount > 0;
  const bio = (coach.tagline || coach.coachDesc || "").trim();

  return (
    <article className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--mc-secondary)]/12 bg-surface p-4 shadow-[0_8px_24px_rgba(0,75,62,0.06)] transition hover:shadow-[0_12px_28px_rgba(0,75,62,0.1)] sm:p-5">
      <div className="flex gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-1 ring-[color:var(--mc-secondary)]/15 sm:size-[5.5rem]">
          <CoachPhoto
            src={photo}
            alt={coach.coachName}
            className="object-cover"
            sizes="88px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-bold text-ink sm:text-xl">
            {coach.coachName}
          </h3>
          <p className="mt-0.5 truncate text-sm text-mc-secondary">
            {coach.coachTypeName || "Personal Coach"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
            {showRating ?
              <span className="inline-flex items-center gap-1">
                <Star
                  className="size-3.5 text-[color:var(--mc-accent)]"
                  aria-hidden
                />
                {coach.rating.toFixed(1)} ({coach.reviewCount})
              </span>
            : null}
            {coach.experienceYears > 0 ?
              <span>{coach.experienceYears} Yrs</span>
            : null}
            {coach.city_Cd ?
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin
                  className="size-3.5 shrink-0 text-mc-secondary"
                  aria-hidden
                />
                <span className="truncate">{coach.city_Cd}</span>
              </span>
            : null}
          </div>
          <Link
            href={href}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-mc-brand-coach px-4 text-xs font-bold text-white transition hover:brightness-105 active:scale-[0.98]"
          >
            View Profile
          </Link>
        </div>
      </div>
      {bio ?
        <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{bio}</p>
      : null}
      {tags.length > 0 ?
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--mc-secondary)]/20 bg-[color:var(--mc-explore-canvas)] px-2.5 py-1 text-[11px] font-semibold text-mc-secondary-dark"
            >
              {tag}
            </span>
          ))}
        </div>
      : null}
    </article>
  );
}

function TopRatedCard({ coach }: { coach: CoachPublicListItem }) {
  const href =
    coach.coachCode ?
      `/coach/${encodeURIComponent(coach.coachCode)}`
    : `/coach/${coach.coachId}`;
  const photo = resolveCoachPhotoUrl(coach);

  return (
    <Link
      href={href}
      className="w-40 shrink-0 rounded-[var(--radius-md)] border border-line bg-surface p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative mx-auto size-16 overflow-hidden rounded-full">
        <CoachPhoto
          src={photo}
          alt={coach.coachName}
          className="object-cover"
          sizes="64px"
        />
      </div>
      <p className="mt-2 truncate text-sm font-bold text-ink">
        {coach.coachName}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-ink-muted">
        ★ {coach.rating.toFixed(1)}
      </p>
    </Link>
  );
}
