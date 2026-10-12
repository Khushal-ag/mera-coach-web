import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
};

function remotePatternFromOrigin(raw: string): RemotePattern | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const pattern: RemotePattern = {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    };
    if (url.port) pattern.port = url.port;
    return pattern;
  } catch {
    return null;
  }
}

function patternKey(p: RemotePattern): string {
  return `${p.protocol}://${p.hostname}:${p.port ?? ""}`;
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
}

/**
 * Extra IMAGE_HOSTS entries: `host`, `host:port`, or full `http(s)://host:port`.
 * When a bare hostname matches NEXT_PUBLIC_API_BASE_URL, inherit that origin's
 * protocol + port (avoids "localhost forced to https" / missing-port traps).
 */
function remotePatternsFromImageHosts(
  raw: string,
  apiOrigin: RemotePattern | null,
): RemotePattern[] {
  return raw
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      if (/^https?:\/\//i.test(entry)) {
        const fromUrl = remotePatternFromOrigin(entry);
        return fromUrl ? [fromUrl] : [];
      }

      const [hostname, explicitPort] = entry.split(":");
      if (!hostname) return [];

      // Same host as the API base → use that origin's protocol/port as source of truth.
      if (apiOrigin && apiOrigin.hostname === hostname) {
        const inherited: RemotePattern = {
          protocol: apiOrigin.protocol,
          hostname,
          pathname: "/**",
        };
        const port = explicitPort || apiOrigin.port;
        if (port) inherited.port = port;
        return [inherited];
      }

      if (explicitPort) {
        // host:port without scheme — prefer http for local, https otherwise.
        const protocol =
          !isProd && isLocalHostname(hostname) ? "http" : "https";
        return [
          {
            protocol,
            hostname,
            port: explicitPort,
            pathname: "/**",
          } satisfies RemotePattern,
        ];
      }

      // Bare hostname (e.g. Azure app hostname) — https in all environments.
      // Local bare host without an API match: http in dev only (no forced https).
      if (!isProd && isLocalHostname(hostname)) {
        return [
          {
            protocol: "http",
            hostname,
            pathname: "/**",
          } satisfies RemotePattern,
        ];
      }

      return [
        {
          protocol: "https",
          hostname,
          pathname: "/**",
        } satisfies RemotePattern,
      ];
    });
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const apiBasePattern = remotePatternFromOrigin(apiBaseUrl);
const imageHostPatterns = remotePatternsFromImageHosts(
  process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "",
  apiBasePattern,
);

const remotePatterns: RemotePattern[] = [];
const seen = new Set<string>();
for (const pattern of [
  ...(apiBasePattern ? [apiBasePattern] : []),
  ...imageHostPatterns,
  {
    protocol: "https" as const,
    hostname: "mera-coach.com",
    pathname: "/**",
  },
]) {
  const key = patternKey(pattern);
  if (seen.has(key)) continue;
  seen.add(key);
  remotePatterns.push(pattern);
}

/** CSP for marketing site + Razorpay Checkout + API calls. */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  // Local API documents are often http://localhost:port — allow in non-prod.
  isProd ?
    "img-src 'self' data: blob: https:"
  : "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  isProd ?
    "connect-src 'self' https: https://api.razorpay.com https://lumberjack.razorpay.com"
  : "connect-src 'self' https: http: https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // Avoid auto-writing AGENTS.md on every `next dev`.
  agentRules: false,
  experimental: {
    turbopackRustReactCompiler: true,
  },
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
