/**
 * Mera Coach public website configuration.
 * URLs come from the typed env module (`src/config/env.ts`).
 */

import { env } from "@/config/env";

export const siteConfig = {
  name: "Mera Coach",
  shortName: "Mera Coach",
  description:
    "Mera Coach is an online platform for health and wellness coaches, fitness coaches, and dieticians to manage clients with ease, and for people to find a coach.",
  url: env.siteUrl,
  apiBaseUrl: env.apiBaseUrl,
  email: { team: "Contact@mera-coach.com" },

  authors: [{ name: "Hench Solutions", url: env.siteUrl }],
  creator: "Hench Solutions",
  publisher: "Hench Solutions",

  keywords: [
    "health coach",
    "wellness coach",
    "fitness coach",
    "dietician",
    "mera coach",
    "client management",
    "coaching platform",
  ],

  links: {
    home: "/",
    coaches: "/coach",
    services: "/services",
    register: "/register",
    coachLogin: "/coach-login",
    memberLogin: "/member-login",
    premium: "/premium",
    premiumSuccess: "/premium/success",
    feedback: "/feedback",
    terms: "/terms",
    privacy: "/privacy",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Find A Coach", href: "/coach" },
    { label: "Services", href: "/services" },
    { label: "Join us", href: "/register" },
  ] as const,

  /**
   * Native app handoff. Scheme matches mera-coach-app `app.json` → expo.scheme.
   * Build URLs with `appDeepLink` / `premiumPaidDeepLink` in `@/lib/app-deep-link`.
   */
  app: {
    scheme: "meracoach",
    handoffLabel: "Open Mera Coach app",
  },

  twitter: {
    handle: "",
    site: "",
  },

  /** Brand assets — same as mera-coach-app `assets/brand`. */
  brand: {
    logoMark: "/mc-images/logo-mark.png",
    logoFull: "/mc-images/logo-full.png",
  },

  /** Open Graph / Twitter share image (1200×630). */
  ogImage: {
    url: "/mc-images/og-image.png",
    width: 1200,
    height: 630,
    alt: "Mera Coach — find health & wellness coaches",
  },

  icons: {
    favicon: "/favicon.ico",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
    icon192: "/icon-192.png",
    icon512: "/icon-512.png",
  },

  themeColor: "#004B3E",

  robots: {
    index: true,
    follow: true,
  },
};

export type SiteConfig = typeof siteConfig;
