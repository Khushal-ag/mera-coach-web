"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { BmiMeasurement, BmiReport } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { downloadAuthedPdf } from "@/lib/api/pdf";
import { fetchBmiReport } from "@/lib/api/practice";

function fmt(value: number | null | undefined, digits: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(digits);
}

function bmiTone(bmi?: number | null) {
  if (bmi == null || bmi <= 0)
    return { color: "neutral", label: "—", sub: "No BMI yet" };
  if (bmi < 18.5)
    return { color: "warn", label: "Underweight", sub: "Below normal range" };
  if (bmi < 25) return { color: "ok", label: "Normal", sub: "Healthy range" };
  if (bmi < 30)
    return { color: "warn", label: "Overweight", sub: "Above normal" };
  if (bmi < 35)
    return { color: "danger", label: "Obese I", sub: "Requires attention" };
  if (bmi < 40)
    return { color: "danger", label: "Obese II", sub: "Requires attention" };
  return { color: "danger", label: "Obese III", sub: "Requires attention" };
}

function fatTone(fat: number | null | undefined, gender?: string) {
  const male = gender === "M";
  const norm = male ? "M norm: 10–20%" : "F norm: 18–28%";
  if (fat == null) return { color: "neutral", norm };
  const high = male ? fat > 25 : fat > 32;
  return { color: high ? "danger" : "ok", norm };
}

function initials(name?: string) {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
}

function genderLabel(gender?: string) {
  if (gender === "M") return "Male";
  if (gender === "F") return "Female";
  return gender || "—";
}

function chipClass(bmi?: number) {
  if (bmi == null) return "o";
  if (bmi >= 25) return "r";
  if (bmi >= 18.5) return "g";
  return "o";
}

function HistoryRow({
  row,
  latest,
  gender,
}: {
  row: BmiMeasurement;
  latest?: boolean;
  gender?: string;
}) {
  const fatHigh =
    gender === "M" ? (row.bodyFatPct ?? 0) > 25 : (row.bodyFatPct ?? 0) > 32;
  return (
    <tr className={latest ? "latest" : undefined}>
      <td>{row.assessmentDate || "—"}</td>
      <td>{row.height ?? "—"}</td>
      <td>{fmt(row.weight, 3)}</td>
      <td>
        {latest && row.bodyFatPct != null ?
          <span className={`chip ${fatHigh ? "r" : "g"}`}>
            {fmt(row.bodyFatPct, 2)}
          </span>
        : fmt(row.bodyFatPct, 2)}
      </td>
      <td>{row.visceralFat ?? "—"}</td>
      <td>
        {row.skeletalMusclePct && row.skeletalMusclePct > 0 ?
          fmt(row.skeletalMusclePct, 2)
        : "—"}
      </td>
      <td>{row.bodyAge && row.bodyAge > 0 ? `${row.bodyAge} yrs` : "—"}</td>
      <td>
        {row.restingMetabolism && row.restingMetabolism > 0 ?
          row.restingMetabolism.toLocaleString()
        : "—"}
      </td>
      <td>
        {latest && row.bmi != null ?
          <span className={`chip ${chipClass(row.bmi)}`}>
            {fmt(row.bmi, 2)}
          </span>
        : fmt(row.bmi, 2)}
      </td>
    </tr>
  );
}

function ReportBody({ report }: { report: BmiReport }) {
  const current = report.current;
  const tone = bmiTone(current?.bmi);
  const fat = fatTone(current?.bodyFatPct, report.client.gender);
  const delta = report.weightDelta;
  const needsToLose = (delta ?? 0) > 0;
  const coachLabel = report.coach.businessName || report.coach.coachName || "—";
  const address = [
    report.coach.address,
    report.coach.email,
    report.coach.mobile,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div className="page">
      <div className="header-card">
        <div className="brand">
          {report.coach.logoUrl ?
            <img className="brand-logo" src={report.coach.logoUrl} alt="" />
          : <div className="brand-initials">{initials(coachLabel)}</div>}
          <div className="brand-text">
            <h1>{coachLabel}</h1>
            <p>{address || "—"}</p>
          </div>
        </div>
        <div className="patient-info">
          <div className="pi-item">
            <label>Patient</label>
            <span>{report.client.clientName || "—"}</span>
          </div>
          <div className="pi-item">
            <label>Age / Sex</label>
            <span>{`${report.client.age || "—"} Yrs / ${genderLabel(report.client.gender)}`}</span>
          </div>
          <div className="pi-item">
            <label>Location</label>
            <span>{report.client.location || "—"}</span>
          </div>
          <div className="pi-item">
            <label>Date</label>
            <span>{current?.assessmentDate || report.reportDate || "—"}</span>
          </div>
        </div>
      </div>
      <div className="stat-row">
        <div className={`stat-card ${tone.color}`}>
          <div className="stat-label">Classification</div>
          <div className={`stat-value ${tone.color}`}>
            {report.bmiCategory || tone.label}
          </div>
          <div className="stat-sub">{tone.sub}</div>
        </div>
        <div className={`stat-card ${tone.color}`}>
          <div className="stat-label">Current BMI</div>
          <div className={`stat-value ${tone.color}`}>
            {fmt(current?.bmi, 2)}
          </div>
          <div className="stat-sub">Range: 18.5–24.9 normal</div>
        </div>
        <div className={`stat-card ${fat.color}`}>
          <div className="stat-label">Body Fat %</div>
          <div className={`stat-value ${fat.color}`}>
            {current?.bodyFatPct != null ?
              `${fmt(current.bodyFatPct, 2)}%`
            : "—"}
          </div>
          <div className="stat-sub">{fat.norm}</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-label">Target Weight</div>
          <div className="stat-value ok">{fmt(report.targetWeight, 2)}</div>
          <div className="stat-sub">kg to achieve</div>
        </div>
        <div
          className={`stat-card ${
            delta == null ? "neutral"
            : needsToLose ? "neutral"
            : "ok"
          }`}
        >
          <div className="stat-label">
            {delta == null ?
              "Weight goal"
            : needsToLose ?
              "To Lose"
            : "To Gain"}
          </div>
          <div
            className={`stat-value ${
              delta == null ? "neutral"
              : needsToLose ? "neutral"
              : "ok"
            }`}
          >
            {delta == null ?
              "—"
            : `${needsToLose ? "−" : "+"}${Math.abs(delta).toFixed(1)}`}
          </div>
          <div className="stat-sub">kg total goal</div>
        </div>
      </div>
      <div className="table-card">
        <div className="card-header">
          <h2>Measurement History</h2>
          <div className="tag">BMI Report</div>
        </div>
        <div className="clt-table-wrap">
          <table className="h-table">
            <thead>
              <tr>
                {[
                  "Date",
                  "Ht (cm)",
                  "Wt (kg)",
                  "FAT %",
                  "VFA",
                  "SM %",
                  "Body Age",
                  "RM (kcal)",
                  "BMI",
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <HistoryRow
                row={current ?? {}}
                latest
                gender={report.client.gender}
              />
              {report.history && report.history.length > 0 ?
                <>
                  <tr className="sep-row">
                    <td colSpan={9}>— Past History —</td>
                  </tr>
                  {report.history.map((row, index) => (
                    <HistoryRow
                      key={`${row.assessmentDate ?? "row"}-${index}`}
                      row={row}
                      gender={report.client.gender}
                    />
                  ))}
                </>
              : null}
            </tbody>
          </table>
        </div>
      </div>
      <div className="footer-card">
        Consult a doctor before making changes if: Pregnant · Heart disease ·
        Kidney conditions · Any serious medical illness.
        <br />
        <strong>
          THIS REPORT IS FOR INFORMATIONAL PURPOSES ONLY. WE DON&apos;T DIAGNOSE
          OR TREAT ANY MEDICAL CONDITION.
        </strong>
      </div>
    </div>
  );
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
              err instanceof Error ? err.message : "Failed to load report.",
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

  async function onPdf() {
    if (!session?.coachCode) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await downloadAuthedPdf(
        "v1/Client/bmi-report-pdf",
        { coachCode: session.coachCode, clientCode: code },
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

  const clientHref = `/dashboard/clients/${encodeURIComponent(code)}`;

  return (
    <div className="bmi-report">
      <div className="print-bar">
        {embedded ? null : (
          <Link href={clientHref} className="btn-back">
            ← Back
          </Link>
        )}
        <button
          type="button"
          className="btn-pdf"
          disabled={pdfBusy}
          onClick={() => void onPdf()}
        >
          {pdfBusy ? "Preparing…" : "Download PDF"}
        </button>
      </div>
      {pdfError ?
        <div className="error-card">{pdfError}</div>
      : null}
      {loading ?
        <div className="loading-wrap">
          <p>Loading report…</p>
        </div>
      : error ?
        <div className="error-card">
          <strong>Error:</strong> {error}
        </div>
      : !report ?
        <div className="error-card">
          BMI Health Report is not available for this client.
        </div>
      : <ReportBody report={report} />}
    </div>
  );
}
