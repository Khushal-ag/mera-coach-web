"use client";

import type { WizardController } from "./use-assessment-wizard";

import { MealItemsEditor } from "@/components/assessment/meal-items-editor";
import { MEAL_SLOTS } from "@/constants/lifestyle-options";
import { passesFoodType } from "@/lib/assessment/meal-items";

export function PhaseMeals({ wizard }: { wizard: WizardController }) {
  const { patch, form, foodMaster, foodMasterReady, labelOf } = wizard;
  return (
    <div className="ac-stack space-y-4">
      <p className="text-sm text-ink-muted">
        Add what the client eats in each meal. Calories are approximate.
      </p>
      {MEAL_SLOTS.map((slot) => (
        <MealItemsEditor
          key={`${slot.id}-${foodMasterReady}`}
          label={slot.label}
          text={form.meals[slot.id].text}
          calories={form.meals[slot.id].calories}
          foods={(foodMaster[slot.apiLabel] ?? []).filter((food) =>
            passesFoodType(food.cat, labelOf(form.foodPreference, "PC001")),
          )}
          onChange={(next) =>
            patch("meals", {
              ...form.meals,
              [slot.id]: { text: next.text, calories: next.calories },
            })
          }
        />
      ))}
    </div>
  );
}
