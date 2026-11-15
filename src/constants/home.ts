/** Marketing content and display data for the home page. Components only lay it out. */

import { siteConfig } from "@/config/site";
import {
  COACH_BANNERS,
  PHOTOS,
  portrait,
  PORTRAITS,
  unsplash,
} from "@/constants/images";

const { links } = siteConfig;

/** Brand colours that have to be plain hex in TypeScript, for example to add an alpha suffix. CSS uses the variables in `styles/public.css`. */
export const BRAND_COLORS = {
  primary: "#c04b2b",
  gold: "#c9882a",
  goldDark: "#b07520",
  forest: "#2d6a4f",
  forestDeep: "#1b4332",
  sage: "#3b8a65",
} as const;

// ---- Claims shown across the site. Change a number here and every page follows. ----

/** How many coaches the site says are on the platform. */
export const COACH_COUNT = 500;
export const COACH_COUNT_TEXT = `${COACH_COUNT}+`;

/** The stats strip under the sections: each stat counts up to `target` and shows `unit` after it. */
export const HOME_STATS = [
  { target: COACH_COUNT, unit: "+", label: "Verified Coaches" },
  { target: 25, inline: "K", unit: "+", label: "Happy Clients" },
  { target: 15, unit: "+", label: "Coaching Categories" },
  { target: 4.9, decimals: 1, unit: "/5", label: "Average Rating" },
  { target: 10, inline: "K", unit: "+", label: "Transformations" },
] as const;

// ---- Page text ----

export const HOME_SEO = {
  title: "Mera Coach | Find Verified Health, Fitness & Wellness Coaches",
  description:
    "Mera Coach connects you with verified health, fitness, yoga and nutrition coaches, and gives coaches the tools to manage clients and grow their practice.",
} as const;

export const HOME_HERO = {
  badge: "India's #1 Coach Management Platform",
  titleLines: ["Grow Your", "Health Coaching"],
  titleAccent: "Business",
  subtitle:
    "Manage clients, track progress and build your coaching brand in one platform designed for health coaches.",
  primaryCta: { label: "Start as a Coach", href: links.register },
  secondaryCta: { label: "Find a Coach", href: links.coaches },
  proof: {
    coaches: `${COACH_COUNT_TEXT} Active Coaches`,
    coachesNote: "growing their practice",
    rating: "98% coach satisfaction rate",
  },
  floats: {
    coaches: {
      title: `${COACH_COUNT_TEXT} Active Coaches`,
      note: "Growing their practice",
    },
    clients: { title: "12K+ Clients Managed", note: "Across all categories" },
    top: {
      title: "Top Coaches",
      note: `+${COACH_COUNT} verified coaches`,
    },
  },
  imageAlt: "Health Coaching",
} as const;

export const COACH_CTA = {
  tag: "For Coaches",
  titleLines: ["Grow Your Coaching", "Business with Mera Coach"],
  description: `Join ${COACH_COUNT_TEXT} certified coaches who are growing their wellness practice, reaching more clients and building their personal brand on India's fastest growing coaching platform.`,
  perks: [
    "Free business page / personal website",
    "Client management dashboard",
    "BMI & assessment tools",
    "Product recommendations",
    "Success story showcase",
    "Digital marketing support",
  ],
  primaryCta: { label: "Become a Coach", href: links.register },
  secondaryCta: { label: "Explore Features", href: links.services },
  imageAlt: "Coach Dashboard",
} as const;

export const BLOG_SECTION = {
  tag: "Wellness Blog",
  title: "Tips, Insights & Wellness Wisdom",
  subtitle:
    "Expert-written articles to help you on your health and wellness journey.",
} as const;

// ---- Timing and sizes ----

/** Milliseconds between slides on the two home carousels. */
export const HOME_CAROUSEL_MS = { coaches: 3500, stories: 4000 } as const;

/** Coaches fetched for the featured carousel, and shown in the stories carousel. */
export const HOME_COACH_COUNT = 6;

// ---- Images and people ----

/** The row of coach faces in the hero. */
export const PROOF_AVATARS = [
  portrait(PORTRAITS.ananya),
  portrait(PORTRAITS.rahul),
  portrait(PORTRAITS.priya),
  portrait(PORTRAITS.heroExtra),
];

export const BLOG_POSTS = [
  {
    image: unsplash(PHOTOS.blogNutrition),
    imageAlt: "Indian spices, with turmeric, in a steel masala box",
    category: "Nutrition",
    categoryStyle: undefined,
    date: "Nov 12, 2026",
    title: "10 Superfoods That Can Transform Your Health in 30 Days",
    summary:
      "Discover science-backed superfoods that your nutrition coach recommends for improved energy, immunity and overall wellness...",
    authorAvatar: portrait(PORTRAITS.ananya),
    authorName: "Dr. Ananya Singh",
    readTime: "5 min read",
  },
  {
    image: unsplash(PHOTOS.blogYoga),
    imageAlt: "A woman practising yoga on a mat in a garden",
    category: "Yoga",
    categoryStyle: { background: "#fdf3e0", color: BRAND_COLORS.goldDark },
    date: "Nov 9, 2026",
    title: "Morning Yoga Routine: 15 Minutes to a Productive Day",
    summary:
      "Start your day right with this expert-designed morning yoga sequence that boosts energy, reduces anxiety and sharpens focus...",
    authorAvatar: portrait(PORTRAITS.priya),
    authorName: "Priya Mehta",
    readTime: "4 min read",
  },
  {
    image: unsplash(PHOTOS.blogFitness),
    imageAlt: "A man stretching on a yoga mat by a lake",
    category: "Fitness",
    categoryStyle: { background: "#fdf3e0", color: BRAND_COLORS.gold },
    date: "Nov 5, 2026",
    title: "Beginner's Guide to Starting Your Fitness Journey at Any Age",
    summary:
      "Whether you're 25 or 65, it's never too late or too early. Here's your complete beginner-friendly guide to getting fit...",
    authorAvatar: portrait(PORTRAITS.rahul),
    authorName: "Rahul Sharma",
    readTime: "6 min read",
  },
];

export const PHONE_DEMO_SCREENS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add client" },
  { id: "bmi", label: "Body composition" },
  { id: "diet", label: "Diet plan" },
  { id: "alerts", label: "Notifications" },
] as const;

export const PHONE_DEMO_SCREEN_MS = 8200;

// ---- Coach and category cards ----

/**
 * How a coach card looks for each kind of coach. The first row with a word found in the coach's type name wins;
 * three banners per row are used in turn so neighbouring cards differ.
 */
export const COACH_TYPE_STYLES = [
  {
    words: ["gym", "fitness", "personal"],
    banners: COACH_BANNERS.fitness,
    color: BRAND_COLORS.primary,
  },
  {
    words: ["yoga", "zumba"],
    banners: COACH_BANNERS.yoga,
    color: BRAND_COLORS.goldDark,
  },
  {
    words: ["nutrition", "diet", "lifestyle"],
    banners: COACH_BANNERS.nutrition,
    color: BRAND_COLORS.gold,
  },
  {
    words: ["weight", "transform"],
    banners: COACH_BANNERS.weight,
    color: BRAND_COLORS.primary,
  },
  {
    words: ["holistic", "wellness", "health"],
    banners: COACH_BANNERS.wellness,
    color: BRAND_COLORS.forest,
  },
] as const;

/** Used when no row above matches. */
export const DEFAULT_COACH_TYPE_STYLE = {
  banners: COACH_BANNERS.fallback,
  color: BRAND_COLORS.forestDeep,
};

export const CAT_ICON_BG = [
  "",
  "purple-bg",
  "orange-bg",
  "yellow-bg",
  "blue-bg",
  "pink-bg",
  "teal-bg",
] as const;

export const CAT_COUNT_COLOR = [
  "var(--primary)",
  BRAND_COLORS.goldDark,
  BRAND_COLORS.forest,
  BRAND_COLORS.gold,
  BRAND_COLORS.forest,
  BRAND_COLORS.primary,
  BRAND_COLORS.sage,
] as const;
