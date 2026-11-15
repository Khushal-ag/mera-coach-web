import { siteConfig } from "@/config/site"; /** Premium checkout link, carrying the coach so the page can show who is paying. */

export function premiumHref(
  coach?: { coachId?: number; coachCode?: string } | null,
): string {
  const qs = new URLSearchParams();
  if (coach?.coachId && coach.coachId > 0)
    qs.set("coachId", String(coach.coachId));
  if (coach?.coachCode) qs.set("coachCode", coach.coachCode);
  const query = qs.toString();
  return query ?
      `${siteConfig.links.premium}?${query}`
    : siteConfig.links.premium;
}
