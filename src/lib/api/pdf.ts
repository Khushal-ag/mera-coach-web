import { assertApiBaseUrl } from "@/config/env";
import { clearSession, getCurrentToken } from "@/lib/auth/session";

function filenameFromDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, "").trim());
  } catch {
    return match[1].replace(/"/g, "").trim() || fallback;
  }
}

/**
 * Fetch an authenticated PDF from meracoachapi and trigger a browser download.
 * Mirrors app `downloadAndSharePdf` (Bearer + blob), without Expo FileSystem.
 */
export async function downloadAuthedPdf(
  path: string,
  query: Record<string, string | undefined>,
  fallbackFilename: string,
): Promise<void> {
  const base = assertApiBaseUrl();
  const normalized = path.replace(/^\//, "").replace("{version}", "1");
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, value);
  }
  const url = `${base}/${normalized}${qs.toString() ? `?${qs}` : ""}`;
  const token = getCurrentToken();

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
  }

  if (!res.ok) {
    throw new Error(
      "Could not generate PDF right now. Please try again later.",
    );
  }

  const blob = await res.blob();
  const filename = filenameFromDisposition(
    res.headers.get("content-disposition"),
    fallbackFilename,
  );
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
