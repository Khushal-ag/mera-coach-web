import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const { links } = siteConfig;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        links.dashboard,
        links.premium,
        links.feedback,
        links.coachLogin,
        links.forgotPassword,
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
