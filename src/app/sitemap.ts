import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";

const { links } = siteConfig;

/** The home page is listed without a path, so its URL has no trailing slash. */
const routes = [
  "",
  links.coaches,
  links.bmi,
  links.services,
  links.register,
  links.contact,
  links.terms,
  links.privacy,
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = routes.map((route, index) => ({
    url: `${siteConfig.url}${route}`,
    changeFrequency:
      route === "" || route === links.coaches ? "weekly" : "monthly",
    priority:
      index === 0 ? 1
      : route === links.coaches ? 0.9
      : 0.7,
  }));

  return [...staticRoutes, ...(await publicCoachRoutes())];
}

/** Public coach profiles. Anonymous API, same 60s cache as the directory. */
async function publicCoachRoutes(): Promise<MetadataRoute.Sitemap> {
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
