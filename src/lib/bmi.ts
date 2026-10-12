/** Client-side BMI helpers — same thresholds as mera-coach-app `utils/bmi`. */

type BmiCategoryLabel = "Underweight" | "Normal" | "Overweight" | "Obese";

export type BmiCategory = {
  label: BmiCategoryLabel;
  tone: "accent" | "secondary" | "primary";
};

export function getBmi(
  heightCm: string | number,
  weightKg: string | number,
): number | null {
  const h = parseFloat(String(heightCm));
  const w = parseFloat(String(weightKg));
  if (!h || !w || h <= 0 || w <= 0) return null;
  return w / (h / 100) ** 2;
}

export function getBmiCategory(bmi: number | null): BmiCategory | null {
  if (bmi == null || !Number.isFinite(bmi)) return null;
  if (bmi < 18.5) return { label: "Underweight", tone: "accent" };
  if (bmi < 25) return { label: "Normal", tone: "secondary" };
  if (bmi < 30) return { label: "Overweight", tone: "accent" };
  return { label: "Obese", tone: "primary" };
}

export function formatBmi(bmi: number): string {
  return bmi.toFixed(1);
}
