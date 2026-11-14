/** The three coaching programmes on the services page. Their details open from the tabs under "Complete Health & Coaching Services". */

export type ServiceProgramId = "exercise" | "nutrition" | "diet";

export type ServiceProgram = {
  id: ServiceProgramId;
  /** Shown on the card header, e.g. "Program 01". */
  label: string;
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
