"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, Download } from "lucide-react";

import type { BmiReport } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { downloadAuthedPdf } from "@/lib/api/pdf";
import { fetchBmiReport } from "@/lib/api/practice";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";

export function ClientBmiReportView() {
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

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <nav className="mb-4 print:hidden">
        <Link
          href={`/dashboard/clients/${encodeURIComponent(code)}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Client
        </Link>
      </nav>

      <PracticePageHeader
        title="BMI report"
        description={
          report?.reportDate ?
            `${report.client.clientName || code}, ${report.reportDate}`
          : report?.client.clientName || code
        }
        className="print:shadow-none"
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              className="mc-btn-secondary"
              onClick={() => window.print()}
            >
              Print
            </button>
            <button
              type="button"
              className="mc-btn-primary"
              disabled={pdfBusy}
              onClick={() => void onPdf()}
            >
              <Download className="size-4" aria-hidden />
              {pdfBusy ? "Preparing…" : "Download PDF"}
            </button>
          </div>
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {pdfError ?
        <AlertBanner tone="error">{pdfError}</AlertBanner>
      : null}

      {loading ?
        <PracticeRosterSkeleton rows={4} />
      : !report ?
        <PracticeEmpty
          title="No BMI report yet"
          body="Run a checkup to capture measurements for this client."
        />
      : <div className="space-y-6">
          <section className="mc-panel p-5">
            <h2 className="font-display text-base font-bold text-ink">
              Current metrics
            </h2>
            <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["BMI", displayBmi != null ? formatBmi(displayBmi) : "-"],
                  ["Category", category],
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
                    current?.bodyAge != null ? `${current.bodyAge} yrs` : "-",
                  ],
                ] as const
              ).map(([label, value], index) => (
                <div
                  key={label}
                  className={
                    index === 0 ? "sm:col-span-2 lg:col-span-1" : undefined
                  }
                >
                  <dt className="text-xs font-medium text-ink-muted">
                    {label}
                  </dt>
                  <dd
                    className={
                      index === 0 ?
                        "mt-1 font-display text-3xl font-bold text-ink tabular-nums"
                      : "mt-1 text-sm font-semibold text-ink"
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {report.history && report.history.length > 0 ?
            <section className="mc-roster">
              <h2 className="border-b border-line px-5 py-3 font-display text-base font-bold text-ink">
                History
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
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
                          {row.bmi && row.bmi > 0 ?
                            formatBmi(row.bmi)
                          : getBmi(row.height ?? "", row.weight ?? "") ?
                            formatBmi(
                              getBmi(row.height ?? "", row.weight ?? "")!,
                            )
                          : "-"}
                        </td>
                        <td className="px-4 py-2 tabular-nums">
                          {row.weight ?? "-"}
                        </td>
                        <td className="px-4 py-2 tabular-nums">
                          {row.bodyFatPct != null ? `${row.bodyFatPct}%` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          : null}
        </div>
      }
    </div>
  );
}
