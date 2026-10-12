/**
 * Typed public env for the Mera Coach website.
 * Values come only from process.env — never hardcode secrets or host URLs here.
 * See `.env.example` for documented keys.
 */

function readPublic(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

const siteUrl = stripTrailingSlash(
  readPublic("NEXT_PUBLIC_SITE_URL") ?? "https://mera-coach.com",
);

const apiBaseUrl = stripTrailingSlash(
  readPublic("NEXT_PUBLIC_API_BASE_URL") ?? "",
);

const imageHosts = (readPublic("NEXT_PUBLIC_IMAGE_HOSTS") ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

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
} as const;

export type Env = typeof env;

export function assertApiBaseUrl(): string {
  if (!env.apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and set the API origin.",
    );
  }
  return env.apiBaseUrl;
}
