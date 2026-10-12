import { cacheLife } from "next/cache";

/**
 * Local midnight for public profile event filtering.
 * Kept out of `events.ts` because that module is imported by client forms.
 * Cached so a prerendered coach page does not call `new Date()` itself.
 */
export async function publicEventCutoffMs(): Promise<number> {
  "use cache";
  cacheLife("hours");
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}
