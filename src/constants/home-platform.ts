/** Text for the "Choose Your Path" cards and the coach sections under them (platform features, how it works). */

import { siteConfig } from "@/config/site";
import { COACH_COUNT_TEXT } from "@/constants/home";
import { PHOTOS } from "@/constants/images";

export type PathId = "coach" | "member";

export const PATH_SECTION = {
  tag: "Who Are You Here For?",
  title: "Choose Your Path",
  subtitle:
    "Mera Coach serves both coaches and members. Pick your path and let us do the rest.",
} as const;

/** The two cards. Picking one shows that audience's sections below. */
export const PATH_CARDS = [
  {
    id: "coach",
    photo: PHOTOS.pathCoach,
    photoAlt: "Coach with Nutrition",
    icon: "fas fa-user-tie",
    pillIcon: "fas fa-briefcase",
    pill: "For Coaches",
    title: "Built for Coaches",
    description:
      "Run, grow and scale your coaching practice, from client management to building your personal brand online.",
    features: [
      "Manage all clients from one dashboard",
      "Track health data & client progress",
      "Capture & convert incoming leads",
      "Your own business page / personal website",
      "Showcase client success stories",
      "Build your personal coaching brand",
    ],
    ctaIcon: "fas fa-rocket",
    ctaLabel: "Start as a Coach",
  },
  {
    id: "member",
    photo: PHOTOS.pathMember,
    photoAlt: "Yoga Wellness",
    icon: "fas fa-spa",
    pillIcon: "fas fa-user",
    pill: "For Members",
    title: "Looking for a Coach?",
    description:
      "Find the right expert for your health and wellness goals. Connect, consult and transform your life today.",
    features: [
      `Explore ${COACH_COUNT_TEXT} verified coaches`,
      "Filter by goal, category & location",
      "View real success stories first",
      "Connect directly & start your journey",
      "Track progress with your coach",
      "Personalised plans, not generic advice",
    ],
    ctaIcon: "fas fa-search",
    ctaLabel: "Find a Coach",
  },
] as const;

/** Text with one part in bold. */
type Segment = string | { strong: string };

export type Benefit = {
  icon: string;
  tone: "green" | "blue" | "gold" | "teal" | "purple" | "red";
  title: string;
  text: readonly Segment[];
};

export const PLATFORM_SECTION = {
  tag: "Platform Features",
  title: "Everything You Need to Run Your Coaching Practice",
  subtitle:
    "One platform with all the tools to manage, grow and showcase your coaching business, so you can focus on what matters most: your clients.",
  coachGroup: "For your coaching business",
  wellnessGroup: "For your clients' health & wellness",
} as const;

/** What coaches get from the platform. */
export const COACH_BENEFITS: readonly Benefit[] = [
  {
    icon: "fas fa-users",
    tone: "green",
    title: "Client Management",
    text: [
      "Manage all your clients in one place. Store profiles, track check-ups, view history and stay on top of every client's journey with ease.",
    ],
  },
  {
    icon: "fas fa-chart-line",
    tone: "blue",
    title: "Progress Tracking",
    text: [
      "Track health data, BMI, weight, measurements and milestones over time. Generate insightful progress reports with a single click.",
    ],
  },
  {
    icon: "fas fa-filter",
    tone: "gold",
    title: "Client Acquisition",
    text: [
      "Get discovered by more clients and ",
      {
        strong:
          "Grow your coaching business by capturing, nurturing, and converting leads into paying clients.",
      },
      " Build a predictable client pipeline and never let an opportunity slip through the cracks.",
    ],
  },
  {
    icon: "fas fa-globe",
    tone: "teal",
    title: "Business Page / Personal Website",
    text: [
      "Get your own professional business page (your personal website) on Mera Coach. Share it, promote it and let your page do the selling for you 24/7.",
    ],
  },
  {
    icon: "fas fa-trophy",
    tone: "purple",
    title: "Showcase Success Stories",
    text: [
      "Highlight real client transformations on your profile. Before-and-after stories build trust and attract serious clients to your coaching practice.",
    ],
  },
  {
    icon: "fas fa-star",
    tone: "red",
    title: "Build Your Personal Brand",
    text: [
      "Establish yourself as an authority in your niche. Customise your profile, showcase expertise and grow a recognisable coaching brand online.",
    ],
  },
];

/** What a client gets from health and wellness coaching, shown next to the coach tools. */
export const WELLNESS_BENEFITS: readonly Benefit[] = [
  {
    icon: "fas fa-clipboard-list",
    tone: "green",
    title: "Personalised Plans",
    text: [
      "Exercise, nutrition and diet plans built around your body, goals and lifestyle, not generic advice.",
    ],
  },
  {
    icon: "fas fa-user-check",
    tone: "blue",
    title: "Expert Guidance",
    text: [
      "Work with verified coaches who answer your questions, adjust your plan as you progress and guide you at every step.",
    ],
  },
  {
    icon: "fas fa-bullseye",
    tone: "gold",
    title: "Goals & Motivation",
    text: [
      "Set clear health goals, celebrate every milestone and stay on track with a coach who keeps you accountable.",
    ],
  },
  {
    icon: "fas fa-heartbeat",
    tone: "red",
    title: "Better Physical Health",
    text: [
      "Build strength, stamina and flexibility, manage your weight and lower everyday health risks.",
    ],
  },
  {
    icon: "fas fa-spa",
    tone: "teal",
    title: "Mental Wellness & Balance",
    text: [
      "Reduce stress, sleep better and find calm and focus through mindful movement and healthy routines.",
    ],
  },
  {
    icon: "fas fa-seedling",
    tone: "purple",
    title: "Lasting Lifestyle Change",
    text: [
      "Small, sustainable habits that fit your life, so results last well beyond the first few weeks.",
    ],
  },
];

export const HOW_IT_WORKS = {
  tag: "How It Works",
  title: "Start Your Coaching Journey in 3 Simple Steps",
  subtitle:
    "Getting set up on Mera Coach takes minutes. Here's how coaches go from sign-up to fully running their practice.",
  steps: [
    {
      title: "Sign Up as a Coach",
      text: "Create your coach account and join our growing community in minutes. Set your category, credentials and start building your presence on India's #1 coaching platform.",
    },
    {
      title: "Set Up Your Profile & Services",
      text: "Build your business page (your personal website), define your coaching services and upload your success stories. Your profile is your digital storefront. Make it shine.",
    },
    {
      title: "Start Managing Clients",
      text: "Begin adding clients, tracking their progress and managing leads from one clean dashboard. Watch your coaching practice grow, day by day.",
    },
  ],
  cta: { label: "Register as a Coach", href: siteConfig.links.register },
} as const;

/** Timing for the "Choose Your Path" links that point into a hidden panel (for example /#bmi). */
export const PATH_HASH_RETRY = {
  attempts: 10,
  everyMs: 200,
  scrollDelayMs: 100,
};
