import type { FoodMasterItem } from "@/lib/api/master";

export type MealItem = { name: string; qty: number; kcal: number };

/** Splits meal text into name and quantity pairs. Reads "2x Roti" and "Roti x2", the formats web and app save. */
function parseFoodItemsText(text: string): { name: string; qty: number }[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const leading = /^(\d+)x\s+(.+)$/i.exec(part);
      if (leading) {
        return {
          qty: parseInt(leading[1]!, 10) || 1,
          name: leading[2]!.trim(),
        };
      }
      const trailing = /^(.+?)\s+x(\d+)$/i.exec(part);
      if (trailing) {
        return {
          qty: parseInt(trailing[2]!, 10) || 1,
          name: trailing[1]!.trim(),
        };
      }
      return { qty: 1, name: part };
    });
}

/** Rebuilds items from saved text and calories, spreading leftover calories over unmatched foods like the app. */
export function itemsFromSaved(
  text: string,
  slotCalories: number,
  master: FoodMasterItem[],
): MealItem[] {
  const items: MealItem[] = parseFoodItemsText(text).map(({ name, qty }) => ({
    name,
    qty,
    kcal:
      master.find((m) => m.name.toLowerCase() === name.toLowerCase())?.cal ?? 0,
  }));
  const matched = items.reduce(
    (sum, i) => sum + (i.kcal > 0 ? i.kcal * i.qty : 0),
    0,
  );
  const unmatched = items.filter((i) => i.kcal === 0);
  if (unmatched.length === 0) return items;
  const remaining =
    slotCalories > matched ? slotCalories - matched
    : slotCalories > 0 ? slotCalories
    : 0;
  if (remaining <= 0) return items;
  const units = unmatched.reduce((sum, i) => sum + i.qty, 0);
  const perUnit = Math.max(1, Math.round(remaining / units));
  return items.map((i) => (i.kcal > 0 ? i : { ...i, kcal: perUnit }));
}

/** Text and total calories saved for one meal slot (curFoodItems and curCalories). */
export function describeItems(items: MealItem[]): {
  text: string;
  calories: number;
} {
  return {
    text: items
      .map((i) => (i.qty > 1 ? `${i.qty}x ${i.name}` : i.name))
      .join(", "),
    calories: items.reduce((sum, i) => sum + i.kcal * i.qty, 0),
  };
}

/** Same food-type filter as the app's Current Diet step. */
export function passesFoodType(cat: string, foodTypeLabel: string): boolean {
  if (!foodTypeLabel) return true;
  if (foodTypeLabel === "Vegetarian") return cat === "veg" || cat === "vegan";
  if (foodTypeLabel === "Vegan") return cat === "vegan";
  if (foodTypeLabel === "Eggetarian") return cat !== "nonveg";
  return true;
}
