"use client";

import type { GeneratedDietPlan } from "@/types/practice";

import { formatBmi } from "@/lib/bmi";

export function DietPlanView({ plan }: { plan: GeneratedDietPlan }) {
  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-2xl bg-mc-secondary px-5 py-5 text-white">
          <p className="font-display text-sm font-semibold text-white/80">
            Daily target
          </p>
          <p className="mt-2 font-display text-4xl leading-none font-bold tabular-nums">
            {plan.summary.dailyCalTarget || "-"}
          </p>
          <p className="mt-2 text-sm text-white/75">kcal</p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl border border-[#e5d5c5] bg-[#fdf8f2] px-4 py-3">
            <p className="text-sm text-ink-muted">BMI category</p>
            <p className="mt-1 font-display text-xl font-bold text-ink">
              {plan.summary.bmiCategory || "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e5d5c5] bg-[#fdf8f2] px-4 py-3">
            <p className="text-sm text-ink-muted">BMI</p>
            <p className="mt-1 font-display text-xl font-bold text-mc-secondary tabular-nums">
              {plan.summary.bmi ? formatBmi(plan.summary.bmi) : "-"}
            </p>
          </div>
        </div>
      </div>
      {(plan.recommendations.waterIntake ||
        plan.recommendations.foodsToAvoid ||
        plan.recommendations.supplements ||
        plan.recommendations.healthTips) && (
        <div className="space-y-2 text-sm">
          {plan.recommendations.waterIntake ?
            <p>
              <span className="font-semibold">Water: </span>
              {plan.recommendations.waterIntake}
            </p>
          : null}
          {plan.recommendations.foodsToAvoid ?
            <p>
              <span className="font-semibold">Avoid: </span>
              {plan.recommendations.foodsToAvoid}
            </p>
          : null}
          {plan.recommendations.supplements ?
            <p>
              <span className="font-semibold">Supplements: </span>
              {plan.recommendations.supplements}
            </p>
          : null}
          {plan.recommendations.healthTips ?
            <p>
              <span className="font-semibold">Tips: </span>
              {plan.recommendations.healthTips}
            </p>
          : null}
        </div>
      )}
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-[#e5d5c5]">
        {plan.weeklyPlan.map((meal, i) => (
          <li key={`${meal.mealType}-${i}`} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-ink">{meal.mealType}</p>
              <p className="text-xs text-ink-muted">
                {meal.mealTime}
                {meal.calMin || meal.calMax ?
                  `, ${meal.calMin}-${meal.calMax} kcal`
                : ""}
              </p>
            </div>
            {meal.options.length ?
              <ul className="mt-1 list-inside list-disc text-sm text-ink-muted">
                {meal.options.map((opt) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
            : null}
            {meal.tip ?
              <p className="mt-1 text-xs text-ink-muted">{meal.tip}</p>
            : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
