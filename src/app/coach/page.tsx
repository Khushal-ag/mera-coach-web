import { Suspense } from "react";
import Link from "next/link";

import { Search } from "lucide-react";

import { DirectoryPageSizeSelect } from "@/app/coach/directory-page-size";
import { SyncDirectoryPage } from "@/app/coach/sync-directory-page";
import { CoachDirectoryCard } from "@/components/coach-directory-card";
import { PageBanner } from "@/components/marketing/page-banner";
import {
  CoachCategoryChipSkeleton,
  CoachDirectoryFiltersSkeleton,
  CoachDirectoryGridSkeleton,
  CoachDirectorySearchSkeleton,
} from "@/components/skeletons/coach-card-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { MenuSelect } from "@/components/ui/menu-select";
import { fetchPublicCities, isApiSuccess } from "@/lib/api";
import { fetchCoachCategories } from "@/lib/api/master";
import {
  coachPublicMinRatingParam,
  coachPublicSortParam,
  DEFAULT_DIRECTORY_PAGE_SIZE,
  DIRECTORY_PAGE_SIZES,
  FALLBACK_COACH_CATEGORIES,
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
    <Suspense fallback={<CoachDirectoryFallback />}>
      <CoachDirectoryContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CoachDirectoryContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const chrome = readChrome(params);

  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Find a Coach" }]}
        title="Find Your"
        emphasis="Perfect Coach"
        subtitle="Browse public profiles. Filter by category, city, and rating, then open a coach page to enquire."
      >
        <div className="mt-6 flex max-w-4xl flex-wrap gap-2">
          <FilterChip
            href={buildQuery({ ...chrome.dirParams, category: undefined })}
            active={!chrome.category}
            tone="banner"
          >
            All Coaches
          </FilterChip>
          {chrome.categories.map((item) => (
            <FilterChip
              key={item.code}
              href={buildQuery({ ...chrome.dirParams, category: item.code })}
              active={chrome.category === item.code}
              tone="banner"
            >
              {shortCategoryLabel(item.label)}
            </FilterChip>
          ))}
        </div>
      </PageBanner>

      <section className="bg-paper py-8 sm:py-10">
        <div className="container grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16.5rem,1fr)]">
          <div className="min-w-0">
            <SearchForm chrome={chrome} />
            <Suspense fallback={<CoachDirectoryGridSkeleton />}>
              <CoachDirectoryResults params={params} />
            </Suspense>
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24">
            <Suspense
              fallback={
                <FilterForm
                  chrome={chrome}
                  categories={chrome.categories}
                  cities={chrome.city ? [chrome.city] : []}
                />
              }
            >
              <LiveFilterForm chrome={chrome} />
            </Suspense>
            <BecomeCoachCard />
          </aside>
        </div>
      </section>
    </>
  );
}

function CoachDirectoryFallback() {
  return (
    <>
      <PageBanner
        crumbs={[{ label: "Home", href: "/" }, { label: "Find a Coach" }]}
        title="Find Your"
        emphasis="Perfect Coach"
        subtitle="Browse public profiles. Filter by category, city, and rating, then open a coach page to enquire."
      >
        <CoachCategoryChipSkeleton />
      </PageBanner>
      <section className="bg-paper py-8 sm:py-10">
        <div className="container grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16.5rem,1fr)]">
          <div className="min-w-0">
            <CoachDirectorySearchSkeleton />
            <CoachDirectoryGridSkeleton />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24">
            <CoachDirectoryFiltersSkeleton />
            <BecomeCoachCard />
          </aside>
        </div>
      </section>
    </>
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
    topMode: "none" as const,
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

function readChrome(params: Awaited<SearchParams>) {
  const search = params.search?.trim() || undefined;
  const city = params.city?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const ratingLabel =
    RATING_FILTER_OPTIONS.find((r) => r === params.rating) ??
    RATING_FILTER_OPTIONS[0];
  const sortLabel =
    SORT_OPTIONS.find((s) => s === params.sort) ?? SORT_OPTIONS[0];
  const requestedSize = parseDirectoryPageSize(params.pageSize);
  const categories: { code: string; label: string }[] =
    FALLBACK_COACH_CATEGORIES.map((item) => ({
      code: item.code,
      label: item.label,
    }));
  if (category && !categories.some((item) => item.code === category)) {
    categories.push({ code: category, label: category });
  }
  const dirParams: DirectoryParams = {
    search,
    city,
    category,
    rating: ratingLabel,
    sort: sortLabel,
    pageSize: requestedSize,
  };
  return {
    search,
    city,
    category,
    ratingLabel,
    sortLabel,
    pageSize: requestedSize,
    categories,
    dirParams,
  };
}

type Chrome = ReturnType<typeof readChrome>;

async function CoachDirectoryResults({
  params,
}: {
  params: Awaited<SearchParams>;
}) {
  const view = await loadDirectoryView(params);
  const {
    hasFilters,
    coaches,
    totalCount,
    totalPages,
    errorMessage,
    pageSize,
    page,
    dirParams,
    rangeStart,
    rangeEnd,
  } = view;

  return (
    <div className="mt-4">
      {view.canonical !== rawDirectoryHref(params) ?
        <SyncDirectoryPage href={view.canonical} />
      : null}
      {errorMessage ?
        <AlertBanner tone="error" className="mt-4">
          We could not load coaches right now. Please refresh and try again.
        </AlertBanner>
      : null}
      {!errorMessage && coaches.length === 0 ?
        <div className="mt-4 rounded-[20px] border border-dashed border-line bg-white px-6 py-10">
          <h2 className="font-display text-xl font-bold text-ink">
            No coaches match yet
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            Try another city, category, or keyword.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {hasFilters ?
              <Link href="/coach" className="mc-btn-secondary w-full sm:w-auto">
                Clear filters
              </Link>
            : null}
            <Link href="/register" className="mc-btn-primary w-full sm:w-auto">
              Are you a coach? Start here
            </Link>
          </div>
        </div>
      : null}
      {!errorMessage && coaches.length > 0 ?
        <div>
          <p className="text-sm text-ink-muted">
            Showing{" "}
            <strong className="text-ink">
              {rangeStart}–{rangeEnd}
            </strong>{" "}
            of <strong className="text-ink">{totalCount}</strong> coaches
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {coaches.map((coach) => (
              <CoachDirectoryCard
                key={coach.coachId}
                coach={coach}
                variant="listing"
              />
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
    </div>
  );
}

function SearchForm({ chrome }: { chrome: Chrome }) {
  return (
    <form
      action="/coach"
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-mc-secondary bg-white shadow-[0_4px_20px_rgba(27,67,50,0.12)] sm:flex-row"
    >
      <div className="relative flex min-h-14 flex-1 items-center">
        <Search
          className="pointer-events-none absolute left-4 size-4 text-ink-muted"
          aria-hidden
        />
        <input
          type="search"
          name="search"
          defaultValue={chrome.search ?? ""}
          placeholder="Search by name, city, service, or coach type"
          aria-label="Search coaches"
          className="min-h-14 w-full appearance-none border-0 bg-transparent pr-4 pl-11 text-base text-ink outline-none placeholder:text-ink-muted"
        />
      </div>
      <HiddenFilters
        chrome={chrome}
        keep={["category", "city", "rating", "sort"]}
      />
      <button
        type="submit"
        className="inline-flex min-h-14 items-center justify-center gap-2 bg-mc-secondary px-6 font-display text-sm font-semibold text-white hover:bg-[color:var(--mc-secondary-dark)]"
      >
        <Search className="size-4" aria-hidden />
        Search
      </button>
    </form>
  );
}

function HiddenFilters({
  chrome,
  keep,
}: {
  chrome: Chrome;
  keep: Array<"search" | "category" | "city" | "rating" | "sort">;
}) {
  return (
    <>
      {keep.includes("search") && chrome.search ?
        <input type="hidden" name="search" value={chrome.search} />
      : null}
      {keep.includes("category") && chrome.category ?
        <input type="hidden" name="category" value={chrome.category} />
      : null}
      {keep.includes("city") && chrome.city ?
        <input type="hidden" name="city" value={chrome.city} />
      : null}
      {(
        keep.includes("rating") &&
        chrome.ratingLabel !== RATING_FILTER_OPTIONS[0]
      ) ?
        <input type="hidden" name="rating" value={chrome.ratingLabel} />
      : null}
      {keep.includes("sort") && chrome.sortLabel !== SORT_OPTIONS[0] ?
        <input type="hidden" name="sort" value={chrome.sortLabel} />
      : null}
      {chrome.pageSize !== DEFAULT_DIRECTORY_PAGE_SIZE ?
        <input type="hidden" name="pageSize" value={chrome.pageSize} />
      : null}
    </>
  );
}

function FilterForm({
  chrome,
  categories,
  cities,
}: {
  chrome: Chrome;
  categories: { code: string; label: string }[];
  cities: string[];
}) {
  const cityOptions =
    chrome.city && !cities.includes(chrome.city) ?
      [chrome.city, ...cities]
    : cities;
  return (
    <form
      action="/coach"
      className="rounded-[20px] border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.06)]"
    >
      <h2 className="font-display text-base font-bold text-ink">Filters</h2>
      <HiddenFilters chrome={chrome} keep={["search"]} />
      <div className="mt-4">
        <label
          id="coach-filter-category-label"
          htmlFor="coach-filter-category"
          className="block text-xs font-semibold text-ink-muted"
        >
          Category
        </label>
        <MenuSelect
          id="coach-filter-category"
          aria-labelledby="coach-filter-category-label"
          name="category"
          defaultValue={chrome.category ?? ""}
          className="mt-1.5"
          options={[
            { value: "", label: "All categories" },
            ...categories.map((item) => ({
              value: item.code,
              label: item.label,
            })),
          ]}
        />
      </div>
      <div className="mt-4">
        <label
          id="coach-filter-city-label"
          htmlFor="coach-filter-city"
          className="block text-xs font-semibold text-ink-muted"
        >
          City
        </label>
        <MenuSelect
          id="coach-filter-city"
          aria-labelledby="coach-filter-city-label"
          name="city"
          defaultValue={chrome.city ?? ""}
          className="mt-1.5"
          options={[
            { value: "", label: "All cities" },
            ...cityOptions.map((item) => ({ value: item, label: item })),
          ]}
        />
      </div>
      <div className="mt-4">
        <label
          id="coach-filter-rating-label"
          htmlFor="coach-filter-rating"
          className="block text-xs font-semibold text-ink-muted"
        >
          Rating
        </label>
        <MenuSelect
          id="coach-filter-rating"
          aria-labelledby="coach-filter-rating-label"
          name="rating"
          defaultValue={
            chrome.ratingLabel === RATING_FILTER_OPTIONS[0] ?
              ""
            : chrome.ratingLabel
          }
          className="mt-1.5"
          options={[
            { value: "", label: RATING_FILTER_OPTIONS[0] },
            ...RATING_FILTER_OPTIONS.slice(1).map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />
      </div>
      <div className="mt-4">
        <label
          id="coach-filter-sort-label"
          htmlFor="coach-filter-sort"
          className="block text-xs font-semibold text-ink-muted"
        >
          Sort
        </label>
        <MenuSelect
          id="coach-filter-sort"
          aria-labelledby="coach-filter-sort-label"
          name="sort"
          defaultValue={
            chrome.sortLabel === SORT_OPTIONS[0] ? "" : chrome.sortLabel
          }
          className="mt-1.5"
          options={[
            { value: "", label: SORT_OPTIONS[0] },
            ...SORT_OPTIONS.slice(1).map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />
      </div>
      <button type="submit" className="mc-btn-primary mt-5 w-full">
        Apply filters
      </button>
      <Link
        href="/coach"
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center text-sm font-semibold text-mc-secondary hover:underline"
      >
        Clear all
      </Link>
    </form>
  );
}

async function LiveFilterForm({ chrome }: { chrome: Chrome }) {
  let categories = chrome.categories;
  let cities: string[] = chrome.city ? [chrome.city] : [];
  try {
    const [cats, cityRes] = await Promise.all([
      fetchCoachCategories(),
      fetchPublicCities({
        coachTypeCode: chrome.category || undefined,
      }),
    ]);
    if (cats.length > 0) categories = cats;
    if (isApiSuccess(cityRes) && cityRes.responseObj) {
      cities = cityRes.responseObj;
    }
  } catch {
    // The fallback form already covers category and the current city.
  }
  return <FilterForm chrome={chrome} categories={categories} cities={cities} />;
}

function BecomeCoachCard() {
  return (
    <div className="rounded-[20px] bg-[image:var(--mc-gradient)] p-6 text-white shadow-[0_16px_40px_rgba(27,67,50,0.25)]">
      <h2 className="font-display text-xl font-bold">Become a Coach</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">
        Publish a profile and reach people who are already looking for a coach.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-white/85">
        <li>Free profile setup</li>
        <li>A public page for enquiries</li>
        <li>Client tools in one place</li>
      </ul>
      <Link href="/register" className="mc-btn-primary mc-btn-hero mt-5 w-full">
        Get Started Free
      </Link>
    </div>
  );
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
        className={`${className} cursor-default text-ink-muted/50 opacity-60`}
      >
        {children}
      </button>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={`${className} border-2 border-mc-secondary bg-white text-mc-secondary hover:bg-mc-secondary hover:text-white`}
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
              className="inline-flex size-11 items-center justify-center rounded-full border-2 border-mc-secondary bg-white text-sm font-semibold text-mc-secondary hover:bg-mc-secondary hover:text-white"
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
            "inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-xs font-bold text-mc-primary"
          : "inline-flex min-h-10 items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/20"

        : active ?
          "inline-flex min-h-11 items-center rounded-full bg-mc-primary px-3.5 text-xs font-bold text-white"
        : "inline-flex min-h-11 items-center rounded-full bg-mc-primary-light px-3.5 text-xs font-bold text-mc-primary"

      }
    >
      {children}
    </Link>
  );
}
