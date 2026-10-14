import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

/**
 * Consumer-page metadata. Root layout no longer forces every URL to
 * canonical `/`, so each public page sets its own canonical and share card.
 */
export function publicPageMetadata({
  title,
  description,
  path,
  absolute = false,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  /** Skip the `%s | Mera Coach` title template (home). */
  absolute?: boolean;
  /** Utility pages (login, checkout, feedback) stay out of search results. */
  noindex?: boolean;
}): Metadata {
  const shareTitle = absolute ? title : `${title} | ${siteConfig.name}`;

  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      type: "website",
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage.url,
          width: siteConfig.ogImage.width,
          height: siteConfig.ogImage.height,
          alt: siteConfig.ogImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [siteConfig.ogImage.url],
    },
  };
}
