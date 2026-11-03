import { assertApiBaseUrl } from "@/config/env";
import { clearSession, getCurrentToken } from "@/lib/auth/session";

/** API paths of the PDF reports, relative to the API base. */
export const PDF_PATH = {
  bmiReport: "Client/bmi-report-pdf",
  dietPlan: "Client/diet-plan-pdf",
} as const;

/** Same template HTML the PDF engine uses — for browser Print. */
export const HTML_REPORT_PATH = {
  bmiReport: "Client/bmi-report-html",
  dietPlan: "Client/diet-plan-html",
} as const;

function buildAuthedReportUrl(
  path: string,
  query: Record<string, string | undefined>,
): string {
  const base = assertApiBaseUrl();
  const normalized = path.replace(/^\//, "");
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    qs.set(key, value);
  }
  return `${base}/${normalized}${qs.toString() ? `?${qs}` : ""}`;
}

function authedReportHeaders(accept: string): HeadersInit {
  const token = getCurrentToken();
  return {
    Accept: accept,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Coach-facing copy when meracoachapi returns 503 (non-Windows PDF host). */
export const PDF_HOST_UNAVAILABLE_MESSAGE =
  "PDF download is not available on this server. Use Print, then choose Save as PDF in your browser.";

export function isPdfHostUnavailableError(message: string): boolean {
  return /not available on this host|print instead/i.test(message);
}

export function friendlyPdfError(message: string): {
  tone: "error" | "info";
  text: string;
} {
  if (isPdfHostUnavailableError(message)) {
    return { tone: "info", text: PDF_HOST_UNAVAILABLE_MESSAGE };
  }
  return { tone: "error", text: message };
}

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
/**
 * Open the coach's selected report template in a hidden iframe and invoke print.
 * Matches Download PDF styling (MstCoach.BmiReportTemplate), not the on-screen React layout.
 */
export async function printAuthedHtmlReport(
  path: string,
  query: Record<string, string | undefined>,
): Promise<void> {
  if (typeof window === "undefined") return;

  const url = buildAuthedReportUrl(path, query);
  const res = await fetch(url, {
    method: "GET",
    headers: authedReportHeaders("text/html"),
    cache: "no-store",
  });

  if (res.status === 401) {
    clearSession();
  }

  if (!res.ok) {
    let message = "Could not open the report for printing. Please try again.";
    try {
      const body = (await res.json()) as {
        errorObj?: Array<{ errorMessage?: string }>;
      };
      const apiMsg = body.errorObj?.[0]?.errorMessage?.trim();
      if (apiMsg) message = apiMsg;
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new Error(message);
  }

  const html = await res.text();
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Report print preview");
  iframe.style.cssText =
    "position:fixed;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    throw new Error("Could not open print preview.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    const ready = () => {
      const fontsReady = doc.fonts?.ready;
      if (fontsReady) {
        void fontsReady.then(() => window.setTimeout(resolve, 150));
      } else {
        window.setTimeout(resolve, 150);
      }
    };
    if (doc.readyState === "complete") ready();
    else win.addEventListener("load", ready, { once: true });
  });

  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.setTimeout(() => iframe.remove(), 500);
      resolve();
    };
    win.addEventListener("afterprint", finish, { once: true });
    win.focus();
    win.print();
    window.setTimeout(finish, 120_000);
  });
}

export async function downloadAuthedPdf(
  path: string,
  query: Record<string, string | undefined>,
  fallbackFilename: string,
): Promise<void> {
  const url = buildAuthedReportUrl(path, query);

  const res = await fetch(url, {
    method: "GET",
    headers: authedReportHeaders("application/pdf"),
    cache: "no-store",
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
  }

  if (!res.ok) {
    let message = "Could not generate PDF right now. Please try again later.";
    try {
      const body = (await res.json()) as {
        errorObj?: Array<{ errorMessage?: string }>;
      };
      const apiMsg = body.errorObj?.[0]?.errorMessage?.trim();
      if (apiMsg) message = apiMsg;
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new Error(message);
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
