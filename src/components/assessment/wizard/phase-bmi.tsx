"use client";

import type { WizardController } from "./use-assessment-wizard";

import { formatBmi } from "@/lib/bmi";

export function PhaseBmi({ wizard }: { wizard: WizardController }) {
  const { metrics } = wizard;
  return (
    <div className="space-y-4">
      {!metrics ?
        <p className="text-sm text-ink-muted">
          Height, weight, age, and gender are needed to compute BMI.
        </p>
      : <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {(
            [
              ["BMI", formatBmi(metrics.bmi)],
              ["Category", metrics.bmiCategory],
              ["Body fat", `${metrics.bodyFatPct}%`],
              ["Visceral fat", String(metrics.visceralFat)],
              ["Skeletal muscle", `${metrics.skeletalMusclePct}%`],
              ["Resting metabolism", `${metrics.restingMetabolism} kcal`],
              ["Body age", `${metrics.bodyAge} yrs`],
            ] as const
          ).map(([label, value], index) => (
            <div
              key={label}
              className={index === 0 ? "sm:col-span-2" : undefined}
            >
              <dt className="text-xs font-medium text-ink-muted">{label}</dt>
              <dd
                className={
                  index === 0 ?
                    "mt-1 font-display text-3xl font-bold text-ink tabular-nums"
                  : "mt-1 text-sm font-semibold text-ink"
                }
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      }
    </div>
  );
}
