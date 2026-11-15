/**
 * Typed public env for the Mera Coach website.
 * Values come only from process.env: never hardcode secrets or host URLs here.
 * See `.env.example` for documented keys.
 */

function readPublic(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** A public URL that must be https, so a typo in the env cannot become a script or plain-http link. */
export function readHttpsUrl(value: string | undefined): string | undefined {
  const raw = readPublic(value);
  if (!raw) return undefined;
  try {
    return new URL(raw).protocol === "https:" ? raw : undefined;
  } catch {
    return undefined;
  }
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

// Access NEXT_PUBLIC_* with static property names so Next can inline them
// into both server and client bundles (dynamic process.env[name] is not inlined).
const siteUrl = stripTrailingSlash(
  readPublic(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://www.mera-coach.com",
);

const apiBaseUrl = stripTrailingSlash(
  readPublic(process.env.NEXT_PUBLIC_API_BASE_URL) ?? "",
);

const imageHosts = (readPublic(process.env.NEXT_PUBLIC_IMAGE_HOSTS) ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const social = {
  facebook: readPublic(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK),
  instagram: readPublic(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM),
  x: readPublic(process.env.NEXT_PUBLIC_SOCIAL_X),
  youtube: readPublic(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE),
  linkedin: readPublic(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN),
};

const appLinks = {
  playStore: readHttpsUrl(process.env.NEXT_PUBLIC_PLAY_STORE_URL),
  appStore: readHttpsUrl(process.env.NEXT_PUBLIC_APP_STORE_URL),
};

export const env = {
  /** Canonical public site origin (no trailing slash). */
  siteUrl,
  /**
   * meracoachapi origin (no trailing slash).
   * Required for coaches, register, premium, feedback. Set via NEXT_PUBLIC_API_BASE_URL.
   */
  apiBaseUrl,
  /** Extra hostnames allowed by next/image remotePatterns. */
  imageHosts,
  /** Optional social profile URLs. Only configured ones are rendered. */
  social,
  /** Store listings for the Mera Coach app. A store with no URL shows as "Coming soon". */
  appLinks,
} as const;

export function assertApiBaseUrl(): string {
  if (!env.apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and set the API origin.",
    );
  }
  return env.apiBaseUrl;
}
