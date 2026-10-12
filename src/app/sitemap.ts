import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const routes = [
  "",
  "/coach",
  "/services",
  "/register",
  "/coach-login",
  "/member-login",
  "/premium",
  "/feedback",
  "/terms",
  "/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-12");
  return routes.map((route, index) => ({
    url: `${siteConfig.url}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
