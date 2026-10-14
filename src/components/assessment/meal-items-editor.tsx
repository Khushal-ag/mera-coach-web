"use client";

import { useState } from "react";

import type { FoodMasterItem } from "@/lib/api/master";
import type { MealItem } from "@/lib/assessment/meal-items";

import { fetchFoodCalories } from "@/lib/api/master";
import { describeItems, itemsFromSaved } from "@/lib/assessment/meal-items";

/** One meal slot: pick foods from the master list, set quantities, or look up a food that is not listed. */
export function MealItemsEditor({
  label,
  text,
  calories,
  foods,
  onChange,
}: {
  label: string;
  text: string;
  calories: number;
  foods: FoodMasterItem[];
  onChange: (next: { text: string; calories: number }) => void;
}) {
  const [items, setItems] = useState<MealItem[]>(() =>
    itemsFromSaved(text, calories, foods),
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState(false);
  const [error, setError] = useState("");

  function commit(next: MealItem[]) {
    setItems(next);
    const { text: nextText, calories: nextCal } = describeItems(next);
    onChange({ text: nextText, calories: nextCal });
  }

  function add(name: string, kcal: number) {
    commit([...items, { name, qty: 1, kcal }]);
    setQuery("");
    setError("");
    setOpen(false);
  }

  async function lookUp() {
    const name = query.trim();
    if (!name) {
      setError("Enter a food name to look up calories.");
      return;
    }
    setLookup(true);
    setError("");
    try {
      add(name, await fetchFoodCalories(name, 1));
    } catch {
      setError("Could not look up calories. Try again.");
    } finally {
      setLookup(false);
    }
  }

  const q = query.trim().toLowerCase();
  const matches = foods
    .filter((f) => !q || f.name.toLowerCase().includes(q))
    .slice(0, 40);
  const total = items.reduce((sum, i) => sum + i.kcal * i.qty, 0);

  return (
    <div className="ac-meal">
      <div className="ac-meal-head">
        <span className="mc-field-label">{label}</span>
        <span className="ac-meal-total">~{total} kcal</span>
      </div>
      <div className="ac-meal-items">
        {items.length === 0 ?
          <span className="ac-meal-empty">No items added yet</span>
        : null}
        {items.map((item, index) => (
          <span key={`${item.name}-${index}`} className="ac-meal-chip">
            <span className="ac-meal-name">{item.name}</span>
            <span className="ac-meal-kcal">{item.kcal * item.qty} kcal</span>
            <button
              type="button"
              aria-label={`Decrease ${item.name}`}
              disabled={item.qty <= 1}
              onClick={() =>
                commit(
                  items.map((it, i) =>
                    i === index ? { ...it, qty: it.qty - 1 } : it,
                  ),
                )
              }
            >
              <i className="fas fa-minus" />
            </button>
            <span className="ac-meal-qty">{item.qty}</span>
            <button
              type="button"
              aria-label={`Increase ${item.name}`}
              onClick={() =>
                commit(
                  items.map((it, i) =>
                    i === index ? { ...it, qty: it.qty + 1 } : it,
                  ),
                )
              }
            >
              <i className="fas fa-plus" />
            </button>
            <button
              type="button"
              aria-label={`Remove ${item.name}`}
              onClick={() => commit(items.filter((_, i) => i !== index))}
            >
              <i className="fas fa-times" />
            </button>
          </span>
        ))}
        <button
          type="button"
          className="ac-meal-add"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <i className="fas fa-plus" /> Add item
        </button>
      </div>
      {open ?
        <div className="ac-meal-picker">
          <input
            className="mc-field"
            value={query}
            placeholder="Search foods or type a new one"
            aria-label={`Search foods for ${label}`}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul>
            {matches.map((food) => (
              <li key={food.id}>
                <button type="button" onClick={() => add(food.name, food.cal)}>
                  <span>{food.name}</span>
                  <span>{food.cal} kcal</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ac-meal-lookup">
            <button
              type="button"
              className="mc-btn-secondary"
              disabled={lookup}
              onClick={() => void lookUp()}
            >
              {lookup ? "Looking up" : "Not listed? Look up calories"}
            </button>
            {error ?
              <span role="alert">{error}</span>
            : null}
          </div>
        </div>
      : null}
    </div>
  );
}
