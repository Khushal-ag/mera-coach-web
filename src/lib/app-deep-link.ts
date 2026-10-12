/**
 * Native app deep links. Scheme must match mera-coach-app `app.json` → expo.scheme.
 */

const APP_SCHEME = "meracoach";

/** Build a `meracoach://…` URL (path without leading slash). */
function appDeepLink(
  path = "",
  query?: Record<string, string | undefined | null>,
): string {
  const normalized = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const base =
    normalized ? `${APP_SCHEME}://${normalized}` : `${APP_SCHEME}://`;
  if (!query) return base;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const trimmed = value?.trim();
    if (trimmed) params.set(key, trimmed);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Post-checkout handoff — opens Premium and signals a subscription refresh. */
export function premiumPaidDeepLink(): string {
  return appDeepLink("premium", { paid: "1" });
}

/** Generic open-app handoff (e.g. after feedback). */
export function appHomeDeepLink(): string {
  return appDeepLink();
}
