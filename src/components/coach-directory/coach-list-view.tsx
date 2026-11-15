"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { MasterOption } from "@/lib/api/master";
import type { CoachPublicListItem } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { ListEmpty } from "@/components/list-empty";
import { MenuSelect } from "@/components/ui/menu-select";
import { siteConfig } from "@/config/site";
import { COACHES_PER_PAGE } from "@/constants/coach-directory";
import { COACH_COUNT_TEXT } from "@/constants/home";
import { fetchMasterOptions } from "@/lib/api/master";
import { coachProfilePath } from "@/lib/coach/profile-path";
import { resolveMediaUrl } from "@/lib/media/media-url";

type Query = {
  search: string;
  coachTypeCode: string;
  country: string;
  state: string;
  city: string;
  page: number;
};

function typeClass(type: string, kind: "badge" | "tag" | "spec") {
  const key = type.toLowerCase();
  const name =
    key === "yoga" ? "yoga"
    : key === "nutrition" ? "nutrition"
    : key === "women" ? "women"
    : key === "lifestyle" ? "lifestyle"
    : "";
  if (!name) return "";
  if (kind === "badge") return `badge-${name}`;
  if (kind === "tag") return `tag-${name}`;
  return `spec-${name}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          rating >= star ? "fas fa-star"
          : rating >= star - 0.5 ? "fas fa-star-half-alt"
          : "far fa-star";
        return <i key={star} className={`${icon} cl-star`} />;
      })}
    </>
  );
}

function coachHref(coach: CoachPublicListItem) {
  return coachProfilePath(coach);
}

function pageHref(query: Query, page: number) {
  const params = new URLSearchParams();
  params.set("pageNum", String(page));
  if (query.search) params.set("search", query.search);
  if (query.coachTypeCode) params.set("coachTypeCode", query.coachTypeCode);
  if (query.country) params.set("country", query.country);
  if (query.state) params.set("state", query.state);
  if (query.city) params.set("city", query.city);
  return `${siteConfig.links.coaches}?${params}`;
}

/** States or cities for a parent place; nothing until a parent is chosen. */
async function fetchPlaces(itemType: string, filterText: string) {
  return filterText ? fetchMasterOptions(itemType, filterText) : [];
}

export function CoachListView({
  coaches,
  categories,
  countries,
  topRated,
  totalCount,
  totalPages,
  loadError,
  query,
}: {
  coaches: CoachPublicListItem[];
  categories: MasterOption[];
  countries: MasterOption[];
  /** Highest rated coaches, shown beside the results. */
  topRated: CoachPublicListItem[];
  totalCount: number;
  totalPages: number;
  loadError: string;
  query: Query;
}) {
  const router = useRouter();
  const [listView, setListView] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [sort, setSort] = useState("rating");
  const [minRating, setMinRating] = useState(0);
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(999);
  const [states, setStates] = useState<MasterOption[]>([]);
  const [cities, setCities] = useState<MasterOption[]>([]);
  const activeFilters = [
    query.coachTypeCode,
    query.country,
    query.state,
    query.city,
  ].filter(Boolean).length;
  // On phones the filters start folded away so the results are not pushed far down.
  const [filtersOpen, setFiltersOpen] = useState(activeFilters > 0);

  useEffect(() => {
    if (!query.country) return;
    let cancelled = false;
    void fetchPlaces("State", query.country).then((next) => {
      if (cancelled) return;
      setStates(next);
      if (query.state) {
        void fetchPlaces("City", query.state).then((cityRows) => {
          if (!cancelled) setCities(cityRows);
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query.country, query.state]);

  const listCoaches = coaches;

  const ordered = useMemo(() => {
    const copy = [...listCoaches];
    copy.sort((a, b) => {
      if (sort === "reviews")
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      if (sort === "exp") return b.experienceYears - a.experienceYears;
      if (sort === "newest") return b.coachId - a.coachId;
      return b.rating - a.rating;
    });
    return copy;
  }, [listCoaches, sort]);

  const displayTotal = totalCount;
  const rangeStart =
    displayTotal > 0 ? (query.page - 1) * COACHES_PER_PAGE + 1 : 0;
  const rangeEnd = displayTotal > 0 ? rangeStart + listCoaches.length - 1 : 0;

  /** Back to the unfiltered list: the pills, the dropdowns and the search box all start over. */
  function clearAll() {
    setMinRating(0);
    setExpMin(0);
    setExpMax(999);
    setStates([]);
    setCities([]);
    setResetCount((count) => count + 1);
    router.push(siteConfig.links.coaches);
  }

  function selectCategory(code: string) {
    const select = document.getElementById(
      "fCoachType",
    ) as HTMLSelectElement | null;
    const form = document.getElementById(
      "filterForm",
    ) as HTMLFormElement | null;
    if (select) select.value = code;
    form?.requestSubmit();
  }

  async function onCountryChange(country: string) {
    setStates([]);
    setCities([]);
    const stateEl = document.getElementById(
      "fState",
    ) as HTMLSelectElement | null;
    const cityEl = document.getElementById("fCity") as HTMLSelectElement | null;
    if (stateEl) stateEl.value = "";
    if (cityEl) cityEl.value = "";
    if (!country) return;
    setStates(await fetchPlaces("State", country));
  }

  async function onStateChange(state: string) {
    setCities([]);
    const cityEl = document.getElementById("fCity") as HTMLSelectElement | null;
    if (cityEl) cityEl.value = "";
    if (!state) return;
    setCities(await fetchPlaces("City", state));
  }

  const pageStartRaw = Math.max(1, query.page - 2);
  const effectiveTotalPages = totalPages;
  const pageEnd = Math.min(effectiveTotalPages, pageStartRaw + 4);
  const pageStart = Math.max(1, pageEnd - 4);

  return (
    <div className="mc-public">
      <section className="cl-banner">
        <div className="cl-banner-shapes">
          <div className="cl-bs cl-bs-1" />
          <div className="cl-bs cl-bs-2" />
          <div className="cl-bs cl-bs-3" />
        </div>
        <div className="container">
          <div className="cl-banner-inner">
            <nav className="cl-breadcrumb" aria-label="breadcrumb">
              <Link href="/">
                <i className="fas fa-home" /> Home
              </Link>
              <i className="fas fa-chevron-right cl-bc-sep" />
              <span>Find a Coach</span>
            </nav>
            <h1 className="cl-banner-title">
              Find Your <em>Perfect Coach</em>
            </h1>
            <p className="cl-banner-subtitle">
              Browse {COACH_COUNT_TEXT} verified coaches across Health, Fitness,
              Yoga, Nutrition and Lifestyle. Your transformation starts here.
            </p>
            <div className="cl-cat-pills">
              <button
                type="button"
                className={
                  query.coachTypeCode ? "cl-cat-pill" : "cl-cat-pill active"
                }
                onClick={() => selectCategory("")}
              >
                <i className="fas fa-th-large" /> All Coaches
              </button>
              {categories.map((category) => (
                <button
                  key={category.code}
                  type="button"
                  className={
                    query.coachTypeCode === category.code ?
                      "cl-cat-pill active"
                    : "cl-cat-pill"
                  }
                  onClick={() => selectCategory(category.code)}
                >
                  <i className={category.iconClass || "fas fa-user"} />{" "}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cl-body">
        <div className="container">
          <div className="cl-layout">
            <div className="cl-main">
              <form
                action={siteConfig.links.coaches}
                className="cl-main-search"
                id="searchForm"
                key={`${query.search}-${resetCount}`}
              >
                <div className="cl-main-search-wrap">
                  <i className="fas fa-search cl-main-search-icon" />
                  <input
                    type="text"
                    name="search"
                    defaultValue={query.search}
                    placeholder="Search by name, city, state, service, coach type..."
                    aria-label="Search coaches"
                    autoComplete="off"
                    onChange={(event) => {
                      const hidden = document.getElementById(
                        "fSearch",
                      ) as HTMLInputElement | null;
                      if (hidden) hidden.value = event.target.value;
                    }}
                  />
                  {query.search ?
                    <button
                      type="button"
                      className="cl-search-clear"
                      title="Clear search"
                      onClick={() => {
                        const input = document.querySelector(
                          "#searchForm input[name='search']",
                        ) as HTMLInputElement | null;
                        const hidden = document.getElementById(
                          "fSearch",
                        ) as HTMLInputElement | null;
                        if (input) input.value = "";
                        if (hidden) hidden.value = "";
                        document.getElementById("searchForm")?.dispatchEvent(
                          new Event("submit", {
                            cancelable: true,
                            bubbles: true,
                          }),
                        );
                        (
                          document.getElementById(
                            "searchForm",
                          ) as HTMLFormElement | null
                        )?.requestSubmit();
                      }}
                    >
                      <i className="fas fa-times" />
                    </button>
                  : null}
                  <button type="submit" aria-label="Submit search">
                    <i className="fas fa-search" /> Search
                  </button>
                </div>
              </form>

              <form
                action={siteConfig.links.coaches}
                id="filterForm"
                className="cl-filter-panel"
                key={`${query.coachTypeCode}|${query.country}|${query.state}|${query.city}|${query.search}-${resetCount}`}
              >
                <input
                  type="hidden"
                  name="search"
                  id="fSearch"
                  defaultValue={query.search}
                />
                <input type="hidden" name="pageNum" value="1" />
                <div className="cl-fp-head">
                  <span className="cl-fp-title">
                    <i className="fas fa-sliders-h" /> Filter Coaches
                    {activeFilters > 0 ?
                      <em className="cl-fp-count">{activeFilters}</em>
                    : null}
                  </span>
                  <button
                    type="button"
                    className="cl-fp-toggle"
                    aria-expanded={filtersOpen}
                    aria-controls="clFilterBody"
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    {filtersOpen ? "Hide" : "Show"}{" "}
                    <i
                      className={
                        filtersOpen ? "fas fa-chevron-up" : (
                          "fas fa-chevron-down"
                        )
                      }
                    />
                  </button>
                </div>
                <div
                  id="clFilterBody"
                  className={
                    filtersOpen ? "cl-fp-body cl-fp-body-open" : "cl-fp-body"
                  }
                >
                  <div className="cl-fp-grid">
                    <div className="cl-ff">
                      <label className="cl-ff-label" htmlFor="fCoachType">
                        <i className="fas fa-th-large" /> Category
                      </label>
                      <MenuSelect
                        name="coachTypeCode"
                        id="fCoachType"
                        skin="public"
                        className="ui-select"
                        defaultValue={query.coachTypeCode}
                        aria-label="All Categories"
                        placeholder="All Categories"
                        options={[
                          { value: "", label: "All Categories" },
                          ...categories.map((category) => ({
                            value: category.code,
                            label: category.label,
                          })),
                        ]}
                      />
                    </div>
                    <div className="cl-ff">
                      <label className="cl-ff-label" htmlFor="fCountry">
                        <i className="fas fa-globe" /> Country
                      </label>
                      <MenuSelect
                        name="country"
                        id="fCountry"
                        skin="public"
                        className="ui-select"
                        defaultValue={query.country}
                        aria-label="All"
                        placeholder="All"
                        options={[
                          { value: "", label: "All" },
                          ...countries.map((country) => ({
                            value: country.code,
                            label: country.label,
                          })),
                        ]}
                        onChange={(event) =>
                          void onCountryChange(event.target.value)
                        }
                      />
                    </div>
                    <div className="cl-ff">
                      <label className="cl-ff-label" htmlFor="fState">
                        <i className="fas fa-map" /> State
                      </label>
                      <MenuSelect
                        name="state"
                        id="fState"
                        skin="public"
                        className="ui-select"
                        defaultValue={query.state}
                        aria-label="All"
                        placeholder="All"
                        options={[
                          { value: "", label: "All" },
                          ...states.map((state) => ({
                            value: state.code,
                            label: state.label,
                          })),
                        ]}
                        onChange={(event) =>
                          void onStateChange(event.target.value)
                        }
                      />
                    </div>
                    <div className="cl-ff">
                      <label className="cl-ff-label" htmlFor="fCity">
                        <i className="fas fa-city" /> City
                      </label>
                      <MenuSelect
                        name="city"
                        id="fCity"
                        skin="public"
                        className="ui-select"
                        defaultValue={query.city}
                        aria-label="All Cities"
                        placeholder="All Cities"
                        options={[
                          { value: "", label: "All Cities" },
                          ...cities.map((city) => ({
                            value: city.code,
                            label: city.label,
                          })),
                        ]}
                      />
                    </div>
                  </div>
                  <div className="cl-fp-foot">
                    <div className="cl-ff">
                      <span className="cl-ff-label">
                        <i className="fas fa-star cl-star" /> Min Rating
                      </span>
                      <div className="cl-ff-pills">
                        {[
                          { label: "All", min: 0 },
                          { label: "4.0+", min: 4 },
                          { label: "4.5+", min: 4.5 },
                        ].map((pill) => (
                          <button
                            key={pill.label}
                            type="button"
                            className={
                              minRating === pill.min ?
                                "cl-ff-pill active"
                              : "cl-ff-pill"
                            }
                            onClick={() => setMinRating(pill.min)}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="cl-ff">
                      <span className="cl-ff-label">
                        <i className="fas fa-briefcase" /> Experience
                      </span>
                      <div className="cl-ff-pills">
                        {[
                          { label: "Any", min: 0, max: 999 },
                          { label: "1–3y", min: 1, max: 3 },
                          { label: "3–5y", min: 3, max: 5 },
                          { label: "5–10y", min: 5, max: 10 },
                          { label: "10y+", min: 10, max: 999 },
                        ].map((pill) => (
                          <button
                            key={pill.label}
                            type="button"
                            className={
                              expMin === pill.min && expMax === pill.max ?
                                "cl-ff-pill active"
                              : "cl-ff-pill"
                            }
                            onClick={() => {
                              setExpMin(pill.min);
                              setExpMax(pill.max);
                            }}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="cl-fp-actions">
                      <button
                        type="button"
                        className="cl-ff-clear"
                        onClick={clearAll}
                      >
                        <i className="fas fa-times" /> Clear All
                      </button>
                      <button type="submit" className="cl-ff-apply">
                        <i className="fas fa-check" /> Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="cl-filter-bar">
                <div className="cl-result-info">
                  <i className="fas fa-users cl-result-icon" />
                  {displayTotal > 0 ?
                    <span>
                      Showing{" "}
                      <strong>
                        {rangeStart}&ndash;{rangeEnd}
                      </strong>{" "}
                      of <strong>{displayTotal}</strong> coaches
                    </span>
                  : <span>No coaches found.</span>}
                  {loadError ?
                    <span className="text-danger ms-2">
                      <i className="fas fa-exclamation-circle" /> {loadError}
                    </span>
                  : null}
                </div>
                <div className="cl-filter-controls">
                  <MenuSelect
                    aria-label="Sort coaches"
                    skin="public"
                    className="ui-select cl-sort-select"
                    value={sort}
                    options={[
                      { value: "rating", label: "Sort: Top Rated" },
                      { value: "reviews", label: "Sort: Most Reviewed" },
                      { value: "exp", label: "Sort: Most Experience" },
                      { value: "newest", label: "Sort: Newest" },
                    ]}
                    onChange={(event) => setSort(event.target.value)}
                  />
                  <div
                    className="cl-view-toggle"
                    role="group"
                    aria-label="View mode"
                  >
                    <button
                      type="button"
                      className={
                        listView ? "cl-view-btn" : "cl-view-btn active"
                      }
                      title="Grid View"
                      onClick={() => setListView(false)}
                    >
                      <i className="fas fa-th-large" />
                    </button>
                    <button
                      type="button"
                      className={
                        listView ? "cl-view-btn active" : "cl-view-btn"
                      }
                      title="List View"
                      onClick={() => setListView(true)}
                    >
                      <i className="fas fa-list" />
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={
                  listView ? "cl-coach-grid cl-list-view" : "cl-coach-grid"
                }
                id="coachGrid"
              >
                {ordered.length === 0 ?
                  <ListEmpty title="No coaches found." icon="fas fa-user-tie" />
                : null}
                {ordered.map((coach) => {
                  const hidden =
                    coach.rating < minRating ||
                    coach.experienceYears < expMin ||
                    coach.experienceYears > expMax;
                  const photo = resolveMediaUrl(coach.profile_Pic_Url);
                  const label = coach.coachTypeName || coach.coachTypeCode;
                  const years =
                    coach.experienceYears > 0 ?
                      `${coach.experienceYears} Yr${coach.experienceYears > 1 ? "s" : ""}`
                    : "New";
                  const tags = coach.serviceNames
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .slice(0, 2);
                  return (
                    <div
                      key={coach.coachId || coach.coachCode}
                      className="cl-coach-card"
                      data-cat={coach.coachTypeCode.toLowerCase()}
                      data-rating={coach.rating.toFixed(1)}
                      data-exp={coach.experienceYears}
                      style={hidden ? { display: "none" } : undefined}
                    >
                      <div className="cl-card-img">
                        <CoachPhoto
                          src={photo}
                          alt={coach.coachName}
                          name={coach.coachName}
                        />
                        <span
                          className={`cl-card-badge ${typeClass(coach.coachTypeCode, "badge")}`.trim()}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="cl-card-body">
                        <div className="cl-coach-name">{coach.coachName}</div>
                        <div
                          className={`cl-coach-specialty ${typeClass(coach.coachTypeCode, "spec")}`.trim()}
                        >
                          {label}
                        </div>
                        <div className="cl-coach-meta">
                          {coach.reviewCount > 0 ?
                            <span>
                              <Stars rating={coach.rating} />{" "}
                              {coach.rating.toFixed(1)}{" "}
                              <em>({coach.reviewCount})</em>
                            </span>
                          : <span>
                              <i className="far fa-star" /> New
                            </span>
                          }
                          <span>
                            <i className="fas fa-briefcase" /> {years}
                          </span>
                          {coach.city_Cd ?
                            <span>
                              <i className="fas fa-map-marker-alt" />{" "}
                              {coach.city_Cd}
                            </span>
                          : null}
                        </div>
                        {coach.coachDesc ?
                          <p className="cl-coach-bio">{coach.coachDesc}</p>
                        : null}
                        {tags.length > 0 ?
                          <div className="cl-coach-tags">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className={`cl-tag ${typeClass(coach.coachTypeCode, "tag")}`.trim()}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        : null}
                        <div className="cl-card-footer">
                          {coach.happyClientCount > 0 ?
                            <div className="cl-coach-clients">
                              Clients:{" "}
                              <strong>{coach.happyClientCount}+</strong>
                            </div>
                          : <div />}
                          <Link
                            href={coachHref(coach)}
                            className="btn cl-btn-view"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {effectiveTotalPages > 1 ?
                <nav className="cl-pagination" aria-label="Pagination">
                  {query.page > 1 ?
                    <Link
                      href={pageHref(query, query.page - 1)}
                      className="cl-page-btn"
                      aria-label="Previous page"
                    >
                      <i className="fas fa-chevron-left" />
                    </Link>
                  : <span className="cl-page-btn cl-page-disabled">
                      <i className="fas fa-chevron-left" />
                    </span>
                  }
                  {pageStart > 1 ?
                    <>
                      <Link href={pageHref(query, 1)} className="cl-page-btn">
                        1
                      </Link>
                      {pageStart > 2 ?
                        <span className="cl-page-ellipsis">&hellip;</span>
                      : null}
                    </>
                  : null}
                  {Array.from(
                    { length: pageEnd - pageStart + 1 },
                    (_, index) => {
                      const page = pageStart + index;
                      return page === query.page ?
                          <span
                            key={page}
                            className="cl-page-btn active"
                            aria-current="page"
                          >
                            {page}
                          </span>
                        : <Link
                            key={page}
                            href={pageHref(query, page)}
                            className="cl-page-btn"
                            aria-label={`Page ${page}`}
                          >
                            {page}
                          </Link>;
                    },
                  )}
                  {pageEnd < effectiveTotalPages ?
                    <>
                      {pageEnd < effectiveTotalPages - 1 ?
                        <span className="cl-page-ellipsis">&hellip;</span>
                      : null}
                      <Link
                        href={pageHref(query, effectiveTotalPages)}
                        className="cl-page-btn"
                      >
                        {effectiveTotalPages}
                      </Link>
                    </>
                  : null}
                  {query.page < effectiveTotalPages ?
                    <Link
                      href={pageHref(query, query.page + 1)}
                      className="cl-page-btn"
                      aria-label="Next page"
                    >
                      <i className="fas fa-chevron-right" />
                    </Link>
                  : <span className="cl-page-btn cl-page-disabled">
                      <i className="fas fa-chevron-right" />
                    </span>
                  }
                </nav>
              : null}
            </div>

            <aside className="cl-sidebar">
              {topRated.length > 0 ?
                <div className="cl-widget cl-top-widget">
                  <div className="cl-widget-head">
                    <i className="fas fa-trophy" /> Top Coaches
                  </div>
                  <ul className="cl-top-list">
                    {topRated.map((coach) => {
                      const photo = resolveMediaUrl(coach.profile_Pic_Url);
                      return (
                        <li key={coach.coachId || coach.coachCode}>
                          <Link href={coachHref(coach)} className="cl-top-item">
                            <span className="cl-top-avatar">
                              <CoachPhoto
                                src={photo}
                                alt={coach.coachName}
                                name={coach.coachName}
                              />
                            </span>
                            <span className="cl-top-info">
                              <strong>{coach.coachName}</strong>
                              <span className="cl-top-sub">
                                {coach.coachTypeName || coach.coachTypeCode}
                                {coach.city_Cd ? ` · ${coach.city_Cd}` : ""}
                              </span>
                            </span>
                            <span className="cl-top-rating">
                              {coach.reviewCount > 0 ?
                                <>
                                  <i className="fas fa-star cl-star" />{" "}
                                  {coach.rating.toFixed(1)}
                                </>
                              : "New"}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              : null}

              <div className="cl-widget cl-cta-widget">
                <div className="cl-cta-glow" />
                <div className="cl-cta-inner">
                  <div className="cl-cta-icon-wrap">
                    <i className="fas fa-chalkboard-teacher" />
                  </div>
                  <h3 aria-level={2}>Become a Coach</h3>
                  <p>
                    Join our growing community and reach thousands of clients
                    looking for your expertise.
                  </p>
                  <ul className="cl-cta-perks">
                    <li>
                      <i className="fas fa-check-circle" /> Free profile setup
                    </li>
                    <li>
                      <i className="fas fa-check-circle" /> Access to 10,000+
                      clients
                    </li>
                    <li>
                      <i className="fas fa-check-circle" /> Manage bookings
                      easily
                    </li>
                  </ul>
                  <Link
                    href={siteConfig.links.register}
                    className="cl-btn-join"
                  >
                    <i className="fas fa-rocket" /> Get Started Free
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
