/**
 * Mera Coach public website configuration.
 * URLs come from the typed env module (`src/config/env.ts`).
 */

import { SUPPORT_EMAIL } from "@/config/contact";
import { env } from "@/config/env";

export const siteConfig = {
  name: "Mera Coach",
  shortName: "Mera Coach",
  description:
    "Get found by clients. Grow your coaching business. Mera Coach connects personal trainers and coaches with clients through a public profile, client tools, and a subscription.",
  url: env.siteUrl,
  apiBaseUrl: env.apiBaseUrl,
  /** Public contact — from `@/config/contact`. */
  email: SUPPORT_EMAIL,

  authors: [{ name: "Hench Solutions", url: env.siteUrl }],
  creator: "Hench Solutions",
  publisher: "Hench Solutions",

  keywords: [
    "personal trainer",
    "fitness coach",
    "find a coach",
    "coaching business",
    "public profile",
    "client management",
    "mera coach",
    "dietician",
  ],

  links: {
    home: "/",
    coaches: "/coach",
    services: "/services",
    bmi: "/bmi",
    register: "/register",
    coachLogin: "/coach-login",
    premium: "/premium",
    premiumSuccess: "/premium/success",
    contact: "/contact",
    dashboard: "/dashboard",
    admin: "/admin",
    adminCoaches: "/admin/coaches",
    adminAds: "/admin/ads",
    forgotPassword: "/forgot-password",
    feedback: "/feedback",
    terms: "/terms",
    privacy: "/privacy",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Find a Coach", href: "/coach" },
    { label: "Features", href: "/services" },
    { label: "Blog", href: "/#blog" },
    { label: "Contact", href: "/contact" },
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

  /** Brand assets: same as mera-coach-app `assets/brand`. */
  brand: {
    logoMark: "/mc-images/logo-mark.png",
  },

  /** Open Graph / Twitter share image (1200×630). */
  ogImage: {
    url: "/mc-images/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "Mera Coach homepage: grow your health coaching business",
  },

  icons: {
    favicon: "/favicon.ico",
    favicon16: "/favicon-16x16.png",
    favicon32: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
    icon192: "/icon-192.png",
    icon512: "/icon-512.png",
  },

  themeColor: "#1b4332",

  robots: {
    index: true,
    follow: true,
  },
};
