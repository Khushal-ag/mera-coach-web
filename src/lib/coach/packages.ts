import type { CoachPackage } from "@/types/coach";

import { MAX_COACH_PACKAGES } from "@/constants/coach";
import { coerceJsonList } from "@/lib/coach/coerce-json-list";

/** Accept arrays or JSON strings from profile GET responses. */
export function parseCoachPackages(raw: unknown): CoachPackage[] {
  const list = coerceJsonList(raw);
  return list
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = String(row.name ?? row.title ?? "").trim();
      if (!name) return null;
      const imageUrl = String(row.imageUrl ?? row.image ?? "").trim();
      return {
        id: String(row.id ?? `pkg_${index}`),
        name,
        price: String(row.price ?? row.priceInr ?? "").trim(),
        duration: String(
          row.duration ?? row.sessions ?? row.durationOrSessions ?? "",
        ).trim(),
        description: String(row.description ?? row.desc ?? "").trim(),
        ...(imageUrl ? { imageUrl } : {}),
      } satisfies CoachPackage;
    })
    .filter((p): p is CoachPackage => !!p)
    .slice(0, MAX_COACH_PACKAGES);
}

export function pickPackagesRaw(raw: Record<string, unknown>): unknown {
  return (
    raw.packages ??
    raw.Packages ??
    raw.packagesJson ??
    raw.PackagesJson ??
    raw.products ??
    raw.productsJson
  );
}
