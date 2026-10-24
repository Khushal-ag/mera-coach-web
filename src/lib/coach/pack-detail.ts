/** A trailing pack size such as "50 gms", "400 g", "30 caps" or "1 ltr". */
const PACK_SUFFIX =
  /^(.*?)[\s,\-–—(]*\b(\d+(?:\.\d+)?\s*(?:gms?|grams?|g|kgs?|ml|ltrs?|l|caps?|capsules?|tabs?|tablets?|sachets?|sticks?|pcs?|pieces?|nos?|servings?))\b\.?\)?\s*$/i;

/**
 * Product names carry their pack size at the end ("Afresh Energy Drink Mix - Elaichi-50 gms"). Splits it off so a
 * package can show the name on the left and the pack on the right. `pack` is empty when no size is recognised.
 */
export function splitPackDetail(itemName: string): {
  name: string;
  pack: string;
} {
  const full = itemName.trim();
  const match = PACK_SUFFIX.exec(full);
  const name = (match?.[1] ?? "").replace(/[\s,\-–—(]+$/, "");
  if (!match || !name) return { name: full, pack: "" };
  return { name, pack: (match[2] ?? "").replace(/\s+/g, " ") };
}
