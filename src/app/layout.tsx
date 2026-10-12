import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";

import { SiteShell } from "@/components/site-shell";
import { siteConfig } from "@/config/site";
import * as fonts from "@/lib/fonts";
import { cn } from "@/lib/utils";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      alternateName: siteConfig.shortName,
      description: siteConfig.description,
      url: siteConfig.url,
      inLanguage: "en-US",
      publisher: {
        "@type": "Organization",
        name: siteConfig.publisher,
        url: siteConfig.url,
      },
    },
    {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      email: siteConfig.email.team,
      logo: `${siteConfig.url}${siteConfig.brand.logoMark}`,
      image: `${siteConfig.url}${siteConfig.ogImage.url}`,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          fonts.montserrat.variable,
          fonts.poppins.variable,
          "min-h-dvh scroll-smooth font-sans antialiased",
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
  themeColor: siteConfig.themeColor,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Welcome - Mera Coach",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  applicationName: siteConfig.shortName,
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: siteConfig.robots.index,
    follow: siteConfig.robots.follow,
    googleBot: {
      index: siteConfig.robots.index,
      follow: siteConfig.robots.follow,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "mera-coach.com | Find Health Coach - Wellness Coach",
    description: siteConfig.description,
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
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage.url],
  },
  icons: {
    icon: [
      { url: siteConfig.icons.favicon, sizes: "any" },
      {
        url: siteConfig.icons.favicon16,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: siteConfig.icons.favicon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: siteConfig.icons.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: siteConfig.icons.icon512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: siteConfig.icons.apple, sizes: "180x180" }],
    shortcut: [siteConfig.icons.favicon],
  },
  manifest: "/site.webmanifest",
  category: "health",
};
