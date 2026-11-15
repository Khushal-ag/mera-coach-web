/** Text for the services page. The three coaching programmes open from the tabs under "Complete Health & Coaching Services". */

import { siteConfig } from "@/config/site";
import { COACH_COUNT_TEXT } from "@/constants/home";

const { links } = siteConfig;

export type ServiceProgramId = "exercise" | "nutrition" | "diet";

export type ServiceProgram = {
  id: ServiceProgramId;
  /** Shown on the card header, e.g. "Program 01". */
  label: string;
  /** The short line under the title on the services hero tile. */
  tagline: string;
  icon: string;
  title: string;
  tone: "green" | "gold" | "red";
  description: string;
  features: string[];
  tags: string[];
  findLabel: string;
};

export const SERVICE_PROGRAMS: ServiceProgram[] = [
  {
    id: "exercise",
    tagline: "Tailored workout plans",
    label: "Program 01",
    icon: "fas fa-dumbbell",
    title: "Exercise Program",
    tone: "green",
    description:
      "Structured, progressive workout plans designed to your fitness level, whether you're a complete beginner or a seasoned athlete.",
    features: [
      "Custom workout plans by certified fitness trainers",
      "Progressive overload & periodisation schedules",
      "Home, gym & hybrid training options",
      "Video demonstrations & form guidance",
      "Weekly programme adjustments based on progress",
      "Injury prevention & mobility protocols",
    ],
    tags: ["Strength", "Fat Loss", "HIIT", "Cardio", "Functional"],
    findLabel: "Find a Fitness Coach",
  },
  {
    id: "nutrition",
    tagline: "Certified nutritionists",
    label: "Program 02",
    icon: "fas fa-apple-alt",
    title: "Nutrition Plans",
    tone: "gold",
    description:
      "Personalised meal plans crafted by certified nutritionists to fuel your training, support recovery, and help you build sustainable eating habits.",
    features: [
      "Custom macro & calorie targets per body type",
      "Weekly meal plans with simple Indian recipes",
      "Supplement guidance & timing protocols",
      "Hydration & micronutrient planning",
      "Food preference & allergy accommodation",
      "Vegetarian, vegan & regional diet options",
    ],
    tags: ["Muscle Gain", "Weight Loss", "Macros", "Indian Diet", "Vegan"],
    findLabel: "Find a Nutritionist",
  },
  {
    id: "diet",
    tagline: "Science-backed diets",
    label: "Program 03",
    icon: "fas fa-utensils",
    title: "Diet Program",
    tone: "red",
    description:
      "Condition-specific and goal-oriented dietary programmes backed by clinical nutrition science, for weight management, gut health, heart wellness, skin & beyond.",
    features: [
      "Weight management & body recomposition plans",
      "Digestive & gut health protocols",
      "Heart-healthy & cholesterol-lowering diets",
      "Diabetic & medical condition diet support",
      "Anti-inflammatory & longevity protocols",
    ],
    tags: ["Gut Health", "Diabetes", "Heart", "Hormonal"],
    findLabel: "Find a Diet Coach",
  },
];

/** The program a URL hash points at (for /services#diet), or null. */
export function programFromHash(hash: string): ServiceProgramId | null {
  const id = hash.replace(/^#/, "");
  return SERVICE_PROGRAMS.find((program) => program.id === id)?.id ?? null;
}

export const SERVICES_SEO = {
  title: "Coaching Programs and Practice Tools | Mera Coach",
  description:
    "Exercise and nutrition programs for clients, plus client profiles, assessments and reports for coaches. See everything Mera Coach offers.",
} as const;

export const SERVICES_HERO = {
  breadcrumb: "Our Services",
  tag: "What We Offer",
  titleLines: ["Complete Health &", "Coaching"],
  titleAccent: "Services",
  subtitle:
    "From personalised exercise programs to in-depth nutrition plans, smart client profiling, detailed health assessments and data-driven reports, everything you need to transform your coaching practice or reach your wellness goals.",
  primaryCta: { label: "Find a Coach", href: links.coaches },
  secondaryCta: { label: "Explore Services", href: "#coaching" },
  trust: [
    { icon: "fas fa-shield-alt", text: "100% Verified Coaches" },
    { icon: "fas fa-users", text: "10,000+ Active Clients" },
    { icon: "fas fa-star", text: "4.8 Platform Rating" },
  ],
} as const;

export type ServiceToolId = "profiles" | "assessments" | "reports";

/** The practice tools. Each is a card on the page, a tile in the hero and a tab in the strip under it. */
export const SERVICE_TOOLS: readonly {
  id: ServiceToolId;
  num: string;
  tone: "green" | "gold" | "red";
  featured?: boolean;
  icon: string;
  tabLabel: string;
  tileTitle: string;
  tileCaption: string;
  title: string;
  description: string;
  points: readonly string[];
}[] = [
  {
    id: "profiles",
    num: "01",
    tone: "green",
    icon: "fas fa-id-card",
    tabLabel: "Client Profiles",
    tileTitle: "Client Profiles",
    tileCaption: "Detailed health records",
    title: "Detailed Client Profiles",
    description:
      "Comprehensive digital records for every client, personal details, health history, coaching notes, session logs, and progress photos, all in one secure place.",
    points: [
      "Personal info, goals & preferences",
      "Complete health & injury history",
      "Coaching notes & session logs",
      "Progress photo timeline storage",
    ],
  },
  {
    id: "assessments",
    num: "02",
    tone: "gold",
    featured: true,
    icon: "fas fa-heartbeat",
    tabLabel: "Health Assessments",
    tileTitle: "Health Data",
    tileCaption: "Assessments & tracking",
    title: "Health Data & Assessments",
    description:
      "Record and monitor every vital metric that matters. From body composition and fitness evaluations to lifestyle analysis, build a complete health baseline for each client.",
    points: [
      "Body composition & BMI analysis",
      "Vital signs & health markers monitoring",
      "Fitness level & VO2 max evaluation",
      "Sleep, stress & lifestyle analysis",
    ],
  },
  {
    id: "reports",
    num: "03",
    tone: "red",
    icon: "fas fa-chart-bar",
    tabLabel: "Reports",
    tileTitle: "Reports",
    tileCaption: "Recommendations & insights",
    title: "Reports & Recommendations",
    description:
      "Transform raw health data into actionable insights. Generate comprehensive progress reports, share them with clients, and make data-driven decisions to accelerate results.",
    points: [
      "Automated monthly progress reports",
      "Visual charts & trend analysis",
      "AI-powered improvement suggestions",
      "Shareable PDF & digital reports",
    ],
  },
];

export const SERVICE_TOOLS_SECTION = {
  tag: "Platform Tools",
  title: "Smart Client",
  titleAccent: "Management Tools",
  subtitle:
    "Powerful tools for coaches to track, manage and grow their clients. Every detail, every data point, every insight, in one place.",
  cardLink: { label: "Learn More", href: links.register },
} as const;

/** The two closing blocks: one for coaches, one for clients. */
export const SERVICE_CTAS = [
  {
    key: "coach",
    tagIcon: "fas fa-rocket",
    tag: "Get Started Today",
    titleLine: "Ready to Transform Your",
    titleAccent: "Coaching Practice?",
    text: `Join ${COACH_COUNT_TEXT} coaches who are already using Mera Coach to manage clients, deliver better results and grow their business.`,
    button: {
      icon: "fas fa-user-tie",
      label: "Register as a Coach",
      href: links.register,
    },
    photoAlt: "Coaching Practice",
  },
  {
    key: "member",
    tagIcon: "fas fa-heart",
    tag: "For Members",
    titleLine: "Ready for a",
    titleAccent: "Healthier You?",
    text: "Connect with expert coaches for fitness, nutrition, mental wellness, and lasting lifestyle transformation.",
    button: {
      icon: "fas fa-search",
      label: "Find a Coach",
      href: links.coaches,
    },
    photoAlt: "Yoga and wellness",
  },
] as const;
