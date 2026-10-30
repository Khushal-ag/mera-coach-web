import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";

const routes = [
  "",
  "/coach",
  "/bmi",
  "/services",
  "/register",
  "/contact",
  "/terms",
  "/privacy",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route, index) => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
    changeFrequency: route === "" || route === "/coach" ? "weekly" : "monthly",
    priority:
      index === 0 ? 1
      : route === "/coach" ? 0.9
      : 0.7,
  }));

  return [...staticRoutes, ...(await publicCoachRoutes(lastModified))];
}

/** Public coach profiles. Anonymous API, same 60s cache as the directory. */
async function publicCoachRoutes(
  lastModified: Date,
): Promise<MetadataRoute.Sitemap> {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  try {
    let page = 1;
    let totalPages = 1;
    do {
      const response = await fetchPublicCoaches({ page, pageSize: 50 });
      if (!isApiSuccess(response) || !response.responseObj) break;
      totalPages = response.responseObj.totalPages || 1;
      for (const coach of response.responseObj.items) {
        const slug = (
          coach.urlFriendlyName ||
          coach.coachCode ||
          String(coach.coachId)
        ).trim();
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        entries.push({
          url: `${siteConfig.url}/coach/${encodeURIComponent(slug)}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      page += 1;
    } while (page <= totalPages && page <= 20);
  } catch {
    // Static routes still ship if the public directory is down.
  }

  return entries;
}
