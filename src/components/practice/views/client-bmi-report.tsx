"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Download } from "lucide-react";

import type { BmiReport } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
} from "@/components/practice/page-header";
import { ClientBmiSkeleton } from "@/components/skeletons/client-profile-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { downloadAuthedPdf } from "@/lib/api/pdf";
import { fetchBmiReport } from "@/lib/api/practice";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";

function historyBmiLabel(row: {
  bmi?: number | null;
  height?: string | number | null;
  weight?: string | number | null;
}) {
  if (row.bmi && row.bmi > 0) return formatBmi(row.bmi);
  const computed = getBmi(row.height ?? "", row.weight ?? "");
  return computed ? formatBmi(computed) : "-";
}

export function ClientBmiReportView({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code ?? "");
  const { session } = useAuth();
  const [report, setReport] = useState<BmiReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);

  useEffect(() => {
    if (!session?.coachCode || !code) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void fetchBmiReport({ coachCode, clientCode: code })
        .then((data) => {
          if (!cancelled) setReport(data);
        })
        .catch((err) => {
          if (!cancelled)
            setError(
              err instanceof Error ? err.message : "Could not load BMI report.",
            );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode, code]);

  const current = report?.current;
  const displayBmi =
    current?.bmi && current.bmi > 0 ?
      current.bmi
    : getBmi(current?.height ?? "", current?.weight ?? "");
  const category =
    report?.bmiCategory || getBmiCategory(displayBmi)?.label || "-";

  async function onPdf() {
    if (!session?.coachCode) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await downloadAuthedPdf(
        "v1/Client/bmi-report-pdf",
        {
          coachCode: session.coachCode,
          clientCode: code,
        },
        "bmi-report.pdf",
      );
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Could not download PDF.",
      );
    } finally {
      setPdfBusy(false);
    }
  }

  const clientName = report?.client.clientName?.trim() || "Client";
  const clientHref = `/dashboard/clients/${encodeURIComponent(code)}`;
  const description =
    clientName === "Client" ?
      report?.reportDate ?
        `Latest measurements, ${report.reportDate}.`
      : "Measurements from this client's checkups."
    : report?.reportDate ?
      `Latest measurements for ${clientName}, ${report.reportDate}.`
    : `Measurements from ${clientName}'s checkups.`;
  const reportActions = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end print:hidden">
      <button
        type="button"
        className="mc-btn-secondary w-full sm:w-auto"
        onClick={() => window.print()}
      >
        Print
      </button>
      <button
        type="button"
        className="mc-btn-primary w-full sm:w-auto"
        disabled={pdfBusy}
        onClick={() => void onPdf()}
      >
        <Download className="size-4" aria-hidden />
        {pdfBusy ? "Preparing…" : "Download PDF"}
      </button>
    </div>
  );

  return (
    <div className="min-w-0 print:max-w-none">
      {embedded ?
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              BMI report
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          </div>
          {reportActions}
        </div>
      : <PracticePageHeader
          title="BMI report"
          back={{
            href: clientHref,
            label: `Back to ${clientName === "Client" ? "client" : clientName}`,
          }}
          description={description}
          className="print:shadow-none"
          action={reportActions}
        />
      }

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {pdfError ?
        <AlertBanner tone="error">{pdfError}</AlertBanner>
      : null}

      {loading ?
        <ClientBmiSkeleton />
      : !report ?
        <PracticeEmpty
          title="No BMI report yet"
          body="Run a checkup to capture measurements for this client."
        />
      : <div className="space-y-8">
          <section aria-labelledby="current-metrics" className="mc-panel">
            <div className="grid lg:grid-cols-[minmax(0,16rem)_1fr]">
              <div className="bg-mc-secondary px-6 py-6 text-white">
                <p className="font-display text-sm font-semibold text-white/80">
                  BMI
                </p>
                <p className="mt-2 font-display text-6xl leading-none font-bold tabular-nums">
                  {displayBmi != null ? formatBmi(displayBmi) : "-"}
                </p>
                <p className="mt-3 text-sm text-white/80">{category}</p>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <h2
                  id="current-metrics"
                  className="font-display text-lg font-bold tracking-tight text-ink"
                >
                  Current metrics
                </h2>
                <dl className="mt-4 grid gap-x-6 gap-y-5 border-t border-line pt-4 sm:grid-cols-2">
                  {(
                    [
                      [
                        "Weight",
                        current?.weight != null ? `${current.weight} kg` : "-",
                      ],
                      [
                        "Height",
                        current?.height != null ? `${current.height} cm` : "-",
                      ],
                      [
                        "Body fat",
                        current?.bodyFatPct != null ?
                          `${current.bodyFatPct}%`
                        : "-",
                      ],
                      [
                        "Visceral fat",
                        current?.visceralFat != null ?
                          String(current.visceralFat)
                        : "-",
                      ],
                      [
                        "Skeletal muscle",
                        current?.skeletalMusclePct != null ?
                          `${current.skeletalMusclePct}%`
                        : "-",
                      ],
                      [
                        "Resting metabolism",
                        current?.restingMetabolism != null ?
                          `${current.restingMetabolism} kcal`
                        : "-",
                      ],
                      [
                        "Body age",
                        current?.bodyAge != null ?
                          `${current.bodyAge} yrs`
                        : "-",
                      ],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-ink-muted">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {report.history && report.history.length > 0 ?
            <section aria-labelledby="bmi-history">
              <h2
                id="bmi-history"
                className="mb-4 font-display text-xl font-bold tracking-tight text-ink"
              >
                History
              </h2>
              <div className="mc-roster">
                <ul className="divide-y divide-line md:hidden">
                  {report.history.map((row, i) => (
                    <li
                      key={`${row.assessmentDate}-${i}`}
                      className="px-4 py-3"
                    >
                      <p className="font-display font-bold text-ink">
                        {row.assessmentDate || "Checkup"}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        BMI {historyBmiLabel(row)}
                        {", "}
                        {row.weight != null ? `${row.weight} kg` : "Weight -"}
                        {", "}
                        {row.bodyFatPct != null ?
                          `${row.bodyFatPct}% fat`
                        : "Body fat -"}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="mc-roster-head">
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">BMI</th>
                        <th className="px-4 py-2">Weight</th>
                        <th className="px-4 py-2">Body fat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {report.history.map((row, i) => (
                        <tr key={`${row.assessmentDate}-${i}`}>
                          <td className="px-4 py-2">
                            {row.assessmentDate || "-"}
                          </td>
                          <td className="px-4 py-2 tabular-nums">
                            {historyBmiLabel(row)}
                          </td>
                          <td className="px-4 py-2 tabular-nums">
                            {row.weight ?? "-"}
                          </td>
                          <td className="px-4 py-2 tabular-nums">
                            {row.bodyFatPct != null ?
                              `${row.bodyFatPct}%`
                            : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          : null}
        </div>
      }
    </div>
  );
}
