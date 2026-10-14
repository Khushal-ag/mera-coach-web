import { Suspense } from "react";
import { cacheLife } from "next/cache";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachListView } from "@/components/coach-directory/coach-list-view";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";
import { fetchCoachCategories, fetchMasterOptions } from "@/lib/api/master";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Find a Coach in India | Mera Coach",
  description:
    "Browse verified health, fitness, yoga, nutrition and lifestyle coaches across India. Filter by category, city and rating, then contact a coach directly.",
  path: "/coach",
  absolute: true,
});

type SearchParams = Promise<{
  search?: string;
  category?: string;
  coachTypeCode?: string;
  country?: string;
  state?: string;
  city?: string;
  page?: string;
  pageNum?: string;
}>;

async function loadCoachList(input: {
  search: string;
  coachTypeCode: string;
  country: string;
  state: string;
  city: string;
  page: number;
}) {
  "use cache";
  cacheLife("minutes");

  let coaches: CoachPublicListItem[] = [];
  let totalCount = 0;
  let totalPages = 1;
  let loadError = "";

  try {
    const list = await fetchPublicCoaches({
      search: input.search || undefined,
      coachTypeCode: input.coachTypeCode || undefined,
      country: input.country || undefined,
      state: input.state || undefined,
      city: input.city || undefined,
      page: input.page,
      pageSize: 10,
    });
    if (isApiSuccess(list) && list.responseObj) {
      coaches = list.responseObj.items;
      totalCount = list.responseObj.totalCount;
      totalPages = Math.max(1, list.responseObj.totalPages);
    }
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load coaches.";
  }

  const [categories, countries] = await Promise.all([
    fetchCoachCategories(),
    fetchMasterOptions("Country"),
  ]);

  return { coaches, categories, countries, totalCount, totalPages, loadError };
}

export default function CoachDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={null}>
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
  const pageRaw = Number(params.pageNum ?? params.page ?? "1");
  const page = Number.isFinite(pageRaw) ? Math.max(1, Math.floor(pageRaw)) : 1;
  const coachTypeCode = (params.coachTypeCode || params.category || "").trim();
  const query = {
    search: params.search?.trim() ?? "",
    coachTypeCode,
    country: params.country?.trim() ?? "",
    state: params.state?.trim() ?? "",
    city: params.city?.trim() ?? "",
    page,
  };
  const data = await loadCoachList(query);

  return <CoachListView {...data} query={query} />;
}
