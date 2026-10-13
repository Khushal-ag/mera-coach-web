import { Suspense } from "react";
import Link from "next/link";

import { Search } from "lucide-react";

import { DirectoryPageSizeSelect } from "@/app/coach/directory-page-size";
import { SyncDirectoryPage } from "@/app/coach/sync-directory-page";
import {
  CoachDirectoryCard,
  CoachTopRatedStrip,
} from "@/components/coach-directory-card";
import { PageBanner } from "@/components/marketing/page-banner";
import { AlertBanner } from "@/components/ui/alert-banner";
import { SelectField } from "@/components/ui/field";
import {
  coachPublicMinRatingParam,
  coachPublicSortParam,
  DEFAULT_DIRECTORY_PAGE_SIZE,
  DIRECTORY_PAGE_SIZES,
  parseDirectoryPageSize,
  RATING_FILTER_OPTIONS,
  shortCategoryLabel,
  SORT_OPTIONS,
} from "@/lib/coach/directory";
import { loadPublicDirectory } from "@/lib/coach/load-public-directory";
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
  pageSize?: string;
}>;

type DirectoryParams = {
  search?: string;
  city?: string;
  category?: string;
  rating?: string;
  sort?: string;
  pageSize?: number;
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
  if (params.pageSize && params.pageSize !== DEFAULT_DIRECTORY_PAGE_SIZE)
    q.set("pageSize", String(params.pageSize));
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `/coach?${s}` : "/coach";
}

function parseRequestedPage(raw: string | undefined): number {
  const value = Number(raw ?? "1");
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

/** Request URL with only directory keys, so it can be compared to `buildQuery`. */
function rawDirectoryHref(params: {
  search?: string;
  city?: string;
  category?: string;
  rating?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
}): string {
  const q = new URLSearchParams();
  (
    [
      "search",
      "city",
      "category",
      "rating",
      "sort",
      "pageSize",
      "page",
    ] as const
  ).forEach((key) => {
    const value = params[key]?.trim();
    if (value) q.set(key, value);
  });
  const s = q.toString();
  return s ? `/coach?${s}` : "/coach";
}

export default function CoachDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<DirectoryFallback />}>
      <CoachDirectoryBody searchParams={searchParams} />
    </Suspense>
  );
}

async function loadDirectoryView(params: Awaited<SearchParams>) {
  const requestedPage = parseRequestedPage(params.page);
  const requestedSize = parseDirectoryPageSize(params.pageSize);
  const search = params.search?.trim() || undefined;
  const city = params.city?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const ratingLabel =
    RATING_FILTER_OPTIONS.find((r) => r === params.rating) ??
    RATING_FILTER_OPTIONS[0];
  const sortLabel =
    SORT_OPTIONS.find((s) => s === params.sort) ?? SORT_OPTIONS[0];
  const minRating = coachPublicMinRatingParam(ratingLabel) ?? 0;
  const sortBy = coachPublicSortParam(sortLabel);

  const hasFilters = !!(
    search ||
    city ||
    category ||
    ratingLabel !== RATING_FILTER_OPTIONS[0] ||
    sortLabel !== SORT_OPTIONS[0]
  );

  const directoryQuery = {
    search: search ?? "",
    city: city ?? "",
    category: category ?? "",
    minRating,
    sortBy,
    pageSize: requestedSize,
    topMode: "fetch" as const,
  };

  let loaded = await loadPublicDirectory({
    ...directoryQuery,
    page: requestedPage,
  });

  let resolvedPage = requestedPage;
  const emptyPastEnd =
    !loaded.errorMessage &&
    requestedPage > 1 &&
    loaded.coaches.length === 0 &&
    (requestedPage > loaded.totalPages || loaded.totalCount === 0);

  // A page past the end returns no rows, so TotalCount comes back as 0.
  // Load the real last page and render it. The URL is replaced without an error.
  if (emptyPastEnd || (loaded.errorMessage && requestedPage > 1)) {
    const knownLast =
      !loaded.errorMessage && loaded.totalCount > 0 ?
        Math.max(1, loaded.totalPages)
      : null;
    if (knownLast != null && requestedPage > knownLast) {
      resolvedPage = knownLast;
      const lastPage = await loadPublicDirectory({
        ...directoryQuery,
        page: knownLast,
      });
      if (!lastPage.errorMessage) loaded = lastPage;
    } else {
      const probe = await loadPublicDirectory({
        ...directoryQuery,
        page: 1,
      });
      if (!probe.errorMessage) {
        const last = Math.max(1, probe.totalPages);
        if (requestedPage > last) {
          resolvedPage = last;
          loaded =
            last === 1 ? probe : (
              await loadPublicDirectory({
                ...directoryQuery,
                page: last,
              })
            );
        }
      }
    }
  } else if (!loaded.errorMessage && requestedPage > loaded.totalPages) {
    resolvedPage = Math.max(1, loaded.totalPages);
  }

  const {
    coaches,
    topRated,
    cities,
    categories,
    totalCount,
    totalPages,
    errorMessage,
  } = loaded;

  const pageSize =
    totalCount > DEFAULT_DIRECTORY_PAGE_SIZE ? requestedSize : (
      DEFAULT_DIRECTORY_PAGE_SIZE
    );
  const page = Math.min(resolvedPage, Math.max(1, totalPages));

  const dirParams: DirectoryParams = {
    search,
    city,
    category,
    rating: ratingLabel,
    sort: sortLabel,
    pageSize,
  };

  const canonical = buildQuery(dirParams, page);
  const showTopRated = topRated.length > 0;
  const rangeStart = coaches.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = (page - 1) * pageSize + coaches.length;

  return {
    canonical,
    search,
    city,
    category,
    ratingLabel,
    sortLabel,
    hasFilters,
    coaches,
    topRated,
    cities,
    categories,
    totalCount,
    totalPages,
    errorMessage,
    pageSize,
    page,
    dirParams,
    showTopRated,
    rangeStart,
    rangeEnd,
  };
}

async function CoachDirectoryBody({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const view = await loadDirectoryView(params);
  const {
    search,
    city,
    category,
    ratingLabel,
    sortLabel,
    hasFilters,
    coaches,
    topRated,
    cities,
    categories,
    totalCount,
    totalPages,
    errorMessage,
    pageSize,
    page,
    dirParams,
    showTopRated,
    rangeStart,
    rangeEnd,
  } = view;

  return (
    <>
      {view.canonical !== rawDirectoryHref(params) ?
        <SyncDirectoryPage href={view.canonical} />
      : null}
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Find a Coach" }]}
        title="Find your"
        emphasis="perfect coach"
        subtitle="Browse public profiles across fitness, yoga, nutrition, and wellness. Your next coach is already on the directory."
      >
        <div className="mt-6 flex max-w-4xl flex-wrap gap-2">
          <FilterChip
            href={buildQuery({ ...dirParams, category: undefined })}
            active={!category}
            tone="banner"
          >
            All coaches
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.code}
              href={buildQuery({ ...dirParams, category: item.code })}
              active={category === item.code}
              tone="banner"
            >
              {shortCategoryLabel(item.label)}
            </FilterChip>
          ))}
        </div>
      </PageBanner>

      <section className="bg-paper py-8 sm:py-10">
        <div className="container min-w-0">
          <div className="w-full max-w-[52rem] space-y-5">
            <form
              action="/coach"
              className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_40px_rgba(23,134,118,0.08)] sm:flex-row"
            >
              <div className="relative flex min-h-14 flex-1 items-center">
                <Search
                  className="pointer-events-none absolute left-4 size-4 text-ink-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  name="search"
                  defaultValue={search ?? ""}
                  placeholder="Search by name, city, service, or coach type"
                  aria-label="Search coaches"
                  className="min-h-14 w-full bg-transparent pr-4 pl-11 text-sm text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
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
              <PageSizeField pageSize={pageSize} />
              <button
                type="submit"
                className="mc-btn-primary m-2 min-h-12 rounded-xl sm:rounded-full"
              >
                Search
              </button>
            </form>

            <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-8">
              <div>
                <p className="text-xs font-semibold text-ink-muted">Rating</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RATING_FILTER_OPTIONS.map((rating) => (
                    <FilterChip
                      key={rating}
                      href={buildQuery({ ...dirParams, rating })}
                      active={ratingLabel === rating}
                    >
                      {rating}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-muted">Sort</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((sort) => (
                    <FilterChip
                      key={sort}
                      href={buildQuery({ ...dirParams, sort })}
                      active={sortLabel === sort}
                    >
                      {sort}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>

            <form
              action="/coach"
              className="flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:flex-wrap sm:items-end"
            >
              {search ?
                <input type="hidden" name="search" value={search} />
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
              <PageSizeField pageSize={pageSize} />
              <SelectField
                label="Serving city"
                name="city"
                defaultValue={city ?? ""}
                className="w-full sm:w-72"
              >
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectField>
              <button
                type="submit"
                className="mc-btn-primary min-h-11 px-5 text-sm"
              >
                Apply city
              </button>
              {hasFilters ?
                <Link
                  href="/coach"
                  className="mc-btn-secondary min-h-11 px-5 text-sm"
                >
                  Clear filters
                </Link>
              : null}
            </form>
          </div>

          {showTopRated ?
            <section className="mt-10" aria-label="Top rated coaches">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold text-ink">
                  Top rated
                </h2>
                <a
                  href="#all-coaches"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary"
                >
                  All coaches
                </a>
              </div>
              <CoachTopRatedStrip coaches={topRated} />
            </section>
          : null}

          {errorMessage ?
            <AlertBanner tone="error" className="mt-8">
              We could not load coaches right now. Please refresh and try again.
            </AlertBanner>
          : null}

          {!errorMessage && coaches.length === 0 ?
            <div className="mt-10 rounded-[var(--radius-md)] border border-dashed border-line bg-surface px-6 py-10 sm:px-8">
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                No coaches match yet
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
                Try another city, category, or keyword. New personal trainers go
                public as they join.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {hasFilters ?
                  <Link
                    href="/coach"
                    className="mc-btn-secondary w-full sm:w-auto"
                  >
                    Clear filters
                  </Link>
                : null}
                <Link
                  href="/register"
                  className="mc-btn-primary w-full sm:w-auto"
                >
                  Are you a coach? Start here
                </Link>
              </div>
            </div>
          : null}

          {!errorMessage && coaches.length > 0 ?
            <div
              id="all-coaches"
              className={
                showTopRated ? "mt-10 scroll-mt-28" : "mt-8 scroll-mt-28"
              }
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-display text-xl font-bold text-ink">
                  {showTopRated ? "All coaches" : "Coaches"}
                </h2>
                <p className="text-sm text-ink-muted">
                  Showing {rangeStart}-{rangeEnd} of {totalCount}
                </p>
              </div>
              <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {coaches.map((coach) => (
                  <CoachDirectoryCard key={coach.coachId} coach={coach} />
                ))}
              </div>
              <DirectoryPager
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                dirParams={dirParams}
              />
            </div>
          : null}

          <aside className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Looking for a personal trainer?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Browse profiles, compare specialties, and enquire from a coach
                page. Exploring is free.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary"
              >
                Are you a coach? Start here
              </Link>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">
                Check your BMI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Get your BMI in seconds, then share your details so a coach can
                call you back.
              </p>
              <Link
                href="/bmi"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary"
              >
                Open BMI calculator
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function DirectoryFallback() {
  return (
    <div className="min-w-0" aria-busy="true" aria-label="Loading coaches">
      <div className="h-8 w-48 animate-pulse rounded bg-line" />
      <div className="mt-6 h-28 animate-pulse rounded-[var(--radius-md)] bg-line" />
      <div className="mt-8 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-[16.75rem] shrink-0 animate-pulse rounded-2xl bg-line"
          />
        ))}
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[16px] border border-line bg-surface"
          >
            <div className="h-36 animate-pulse bg-line sm:h-40" />
            <div className="space-y-3 px-5 py-5">
              <div className="size-16 animate-pulse rounded-full bg-line" />
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

function PageSizeField({ pageSize }: { pageSize: number }) {
  if (pageSize === DEFAULT_DIRECTORY_PAGE_SIZE) return null;
  return <input type="hidden" name="pageSize" value={pageSize} />;
}

function visiblePages(page: number, totalPages: number): (number | "gap")[] {
  const pages = new Set<number>([1, totalPages]);
  for (let n = page - 1; n <= page + 1; n += 1) {
    if (n >= 1 && n <= totalPages) pages.add(n);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const n = sorted[i]!;
    const prev = sorted[i - 1];
    if (prev != null && n - prev > 1) out.push("gap");
    out.push(n);
  }
  return out;
}

function PagerStep({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex min-h-11 items-center justify-center rounded-full px-3.5 text-sm font-semibold";
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-label={label}
        className={`${className} cursor-not-allowed text-ink-muted/50`}
      >
        {children}
      </button>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${className} text-ink hover:bg-[color:var(--mc-secondary-light)] hover:text-mc-secondary`}
    >
      {children}
    </Link>
  );
}

function DirectoryPager({
  page,
  pageSize,
  totalPages,
  dirParams,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  dirParams: DirectoryParams;
}) {
  if (totalPages <= 1) return null;
  const pages = visiblePages(page, totalPages);
  const sizeOptions = DIRECTORY_PAGE_SIZES.map((size) => ({
    size,
    href: buildQuery({ ...dirParams, pageSize: size }),
  }));
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-end">
      <nav
        aria-label="Coach pages"
        className="flex flex-wrap items-center justify-center gap-1.5"
      >
        <PagerStep
          href={buildQuery(dirParams, page - 1)}
          disabled={page <= 1}
          label="Previous page"
        >
          Previous
        </PagerStep>
        {pages.map((item, index) =>
          item === "gap" ?
            <span
              key={`gap-${index}`}
              className="px-1 text-sm text-ink-muted"
              aria-hidden
            >
              …
            </span>
          : item === page ?
            <span
              key={item}
              aria-current="page"
              aria-label={`Page ${item}`}
              className="inline-flex size-11 items-center justify-center rounded-full bg-mc-secondary text-sm font-bold text-white"
            >
              {item}
            </span>
          : <Link
              key={item}
              href={buildQuery(dirParams, item)}
              aria-label={`Page ${item}`}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold text-ink hover:border-mc-primary"
            >
              {item}
            </Link>,
        )}
        <PagerStep
          href={buildQuery(dirParams, page + 1)}
          disabled={page >= totalPages}
          label="Next page"
        >
          Next
        </PagerStep>
      </nav>
      <DirectoryPageSizeSelect pageSize={pageSize} options={sizeOptions} />
    </div>
  );
}

function FilterChip({
  href,
  active,
  tone = "page",
  children,
}: {
  href: string;
  active: boolean;
  tone?: "page" | "banner";
  children: React.ReactNode;
}) {
  const banner = tone === "banner";
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={
        banner ?
          active ?
            "inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-xs font-bold text-mc-secondary"
          : "inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/20"

        : active ?
          "inline-flex min-h-11 items-center rounded-full bg-mc-secondary px-3.5 text-xs font-bold text-white"
        : "inline-flex min-h-11 items-center rounded-full bg-[color:var(--mc-secondary-light)] px-3.5 text-xs font-bold text-mc-secondary"

      }
    >
      {children}
    </Link>
  );
}
