/** Home page BMI gauge and explanations. */

export const BMI_GAUGE = {
  cx: 160,
  cy: 150,
  r: 108,
  stroke: 22,
  min: 16,
  max: 40,
} as const;

export const BMI_BANDS = [
  { from: 16, to: 18.5, color: "#3b82f6" },
  { from: 18.5, to: 25, color: "#22c55e" },
  { from: 25, to: 30, color: "#f59e0b" },
  { from: 30, to: 40, color: "#ef4444" },
] as const;

export const BMI_TICKS = [16, 18.5, 25, 30, 40] as const;

export const BMI_EXPLANATIONS: Record<string, (bmi: string) => string> = {
  Underweight: (bmi) =>
    `Your BMI of ${bmi} is below the healthy range. This may indicate insufficient nutrition or low muscle mass. A certified nutrition or fitness coach can help you build a healthier body weight safely.`,
  "Healthy Weight": (bmi) =>
    `Great news! Your BMI of ${bmi} is within the healthy range. A wellness or yoga coach can help you maintain this long-term and optimise your energy and fitness.`,
  Overweight: (bmi) =>
    `Your BMI of ${bmi} is above the healthy range. Even modest weight loss of 5–10% can significantly reduce health risks. A weight management or lifestyle coach can create a practical, sustainable plan for you.`,
  Obese: (bmi) =>
    `Your BMI of ${bmi} indicates obesity, which carries significant health risks. A certified weight management or nutrition coach with a structured plan can make a real, life-changing difference.`,
};
