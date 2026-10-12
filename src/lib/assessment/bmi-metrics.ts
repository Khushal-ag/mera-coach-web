import { getBmiCategory } from "@/lib/bmi";

export type BodyMetrics = {
  bmi: number;
  bmiCategory: string;
  bodyFatPct: number;
  visceralFat: number;
  skeletalMusclePct: number;
  restingMetabolism: number;
  bodyAge: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Same coefficients as mera-coach-app `computeBodyMetrics` / save-bmi. */
function computeBodyMetrics(input: {
  weight: number;
  height: number;
  age: number;
  gender: string;
}): BodyMetrics {
  const isMale = input.gender === "M";
  const heightM = input.height / 100;
  const bmi = round1(input.weight / (heightM * heightM));
  const bmiCategory = getBmiCategory(bmi)?.label ?? "";

  const sexFactor = isMale ? 1.0 : 0.0;
  const bodyFatPct = clamp(
    round1(1.2 * bmi + 0.23 * input.age - 10.8 * sexFactor - 5.4),
    3,
    60,
  );
  const visceralFat = Math.round(
    clamp(0.59 * bmi + 0.097 * input.age - (isMale ? 6.5 : 8.5), 1, 59),
  );
  const lbm =
    isMale ?
      0.3281 * input.weight + 0.3393 * input.height - 29.5336
    : 0.2994 * input.weight + 0.7058 * input.height - 14.6712;
  const skeletalMusclePct = clamp(
    round1(((lbm * 0.5) / input.weight) * 100),
    20,
    60,
  );
  const restingMetabolism = Math.round(
    10 * input.weight +
      6.25 * input.height -
      5 * input.age +
      (isMale ? 5 : -161),
  );
  const idealFat =
    isMale ?
      input.age < 30 ? 15
      : input.age < 40 ? 17
      : input.age < 50 ? 20
      : 22
    : input.age < 30 ? 22
    : input.age < 40 ? 24
    : input.age < 50 ? 27
    : 30;
  const bodyAge = Math.round(
    clamp(input.age + (bodyFatPct - idealFat) * 0.5, 5, 80),
  );

  return {
    bmi,
    bmiCategory,
    bodyFatPct,
    visceralFat,
    skeletalMusclePct,
    restingMetabolism,
    bodyAge,
  };
}

export function computeBmiMetrics(profile: {
  weight: string | number;
  height: string | number;
  age: string | number;
  gender: string;
}): BodyMetrics | null {
  const weight = parseFloat(String(profile.weight));
  const height = parseInt(String(profile.height), 10);
  const age = parseInt(String(profile.age), 10);
  if (!weight || !height || !age || !profile.gender) return null;
  return computeBodyMetrics({ weight, height, age, gender: profile.gender });
}
