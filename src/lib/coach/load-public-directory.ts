import { cacheLife } from "next/cache";

import type { CoachPublicListItem } from "@/types/coach";

import {
  fetchCoachCategories,
  fetchPublicCities,
  fetchPublicCoaches,
  firstApiError,
  isApiSuccess,
} from "@/lib/api";
import { FALLBACK_COACH_CATEGORIES } from "@/lib/coach/directory";

export type PublicDirectoryQuery = {
  search: string;
  city: string;
  category: string;
  /** 0 means no minimum. */
  minRating: number;
  sortBy: "rating" | "reviews" | "experience";
  page: number;
  pageSize: number;
  /** none: skip the strip. fetch: compact top-rated row for the same filters. */
  topMode: "none" | "fetch";
};

export type PublicDirectoryData = {
  coaches: CoachPublicListItem[];
  topRated: CoachPublicListItem[];
  cities: string[];
  categories: { code: string; label: string }[];
  totalCount: number;
  totalPages: number;
  errorMessage: string | null;
};

/**
 * Public coach directory payload.
 * Cached so the fetch clock (`Date.now()` inside the data cache) is not read
 * while the directory route is prerendering under partial prefetching.
 */
export async function loadPublicDirectory(
  query: PublicDirectoryQuery,
): Promise<PublicDirectoryData> {
  "use cache";
  cacheLife("minutes");

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
    const pageSize = Math.max(1, query.pageSize);
    const [listRes, citiesRes, cats, topRes] = await Promise.all([
      fetchPublicCoaches({
        search: query.search || undefined,
        city: query.city || undefined,
        coachTypeCode: query.category || undefined,
        minRating: query.minRating > 0 ? query.minRating : undefined,
        sortBy: query.sortBy,
        page: query.page,
        pageSize,
      }),
      fetchPublicCities({
        coachTypeCode: query.category || undefined,
      }),
      fetchCoachCategories(),
      query.topMode === "fetch" ?
        fetchPublicCoaches({
          search: query.search || undefined,
          city: query.city || undefined,
          coachTypeCode: query.category || undefined,
          minRating: query.minRating > 0 ? query.minRating : undefined,
          sortBy: "rating",
          page: 1,
          pageSize: 6,
        })
      : Promise.resolve(null),
    ]);

    if (cats.length > 0) categories = cats;

    if (!isApiSuccess(listRes)) {
      errorMessage = firstApiError(listRes) ?? "Could not load coaches.";
    } else {
      const rawItems = listRes.responseObj?.items ?? [];
      const reportedTotal = listRes.responseObj?.totalCount ?? rawItems.length;
      const reportedPages = listRes.responseObj?.totalPages ?? 1;
      // Some responses ignore page/pageSize and return the whole filtered set.
      const dumped = rawItems.length > pageSize;
      if (dumped) {
        totalCount = rawItems.length;
        totalPages = Math.max(1, Math.ceil(rawItems.length / pageSize));
        const start = (Math.max(1, query.page) - 1) * pageSize;
        coaches = rawItems.slice(start, start + pageSize);
      } else {
        coaches = rawItems;
        totalCount = Math.max(reportedTotal, rawItems.length);
        const fromCount = Math.ceil(totalCount / pageSize) || 1;
        totalPages = Math.max(1, reportedPages, fromCount);
      }
    }

    if (isApiSuccess(citiesRes)) {
      cities = citiesRes.responseObj ?? [];
    }

    if (topRes && isApiSuccess(topRes)) {
      topRated = (topRes.responseObj?.items ?? [])
        .filter((c) => c.rating > 0)
        .slice(0, 6);
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load coaches.";
  }

  return {
    coaches,
    topRated,
    cities,
    categories,
    totalCount,
    totalPages,
    errorMessage,
  };
}
