"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import type { BmiMeasurement, BmiReport } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { ListEmpty } from "@/components/list-empty";
import { downloadAuthedPdf } from "@/lib/api/pdf";
import { fetchBmiReport } from "@/lib/api/practice";
import { resolveDisplayBmi } from "@/lib/bmi";

function fmt(value: number | null | undefined, digits: number) {
  if (value == null || Number.isNaN(value)) return "-";
  return Number(value).toFixed(digits);
}

function bmiTone(bmi?: number | null) {
  if (bmi == null || bmi <= 0)
    return { color: "neutral", label: "-", sub: "No BMI yet" };
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
  return gender || "-";
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
      <td>{row.assessmentDate || "-"}</td>
      <td>{row.height ?? "-"}</td>
      <td>{fmt(row.weight, 3)}</td>
      <td>
        {latest && row.bodyFatPct != null ?
          <span className={`chip ${fatHigh ? "r" : "g"}`}>
            {fmt(row.bodyFatPct, 2)}
          </span>
        : fmt(row.bodyFatPct, 2)}
      </td>
      <td>{row.visceralFat ?? "-"}</td>
      <td>
        {row.skeletalMusclePct && row.skeletalMusclePct > 0 ?
          fmt(row.skeletalMusclePct, 2)
        : "-"}
      </td>
      <td>{row.bodyAge && row.bodyAge > 0 ? `${row.bodyAge} yrs` : "-"}</td>
      <td>
        {row.restingMetabolism && row.restingMetabolism > 0 ?
          row.restingMetabolism.toLocaleString()
        : "-"}
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
  const shownBmi = resolveDisplayBmi(current);
  const tone = bmiTone(shownBmi);
  const fat = fatTone(current?.bodyFatPct, report.client.gender);
  const delta = report.weightDelta;
  const needsToLose = (delta ?? 0) > 0;
  const coachLabel = report.coach.businessName || report.coach.coachName || "-";
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
            {address ?
              <p>{address}</p>
            : null}
          </div>
        </div>
        <div className="patient-info">
          <div className="pi-item">
            <label>Patient</label>
            <span>{report.client.clientName || "-"}</span>
          </div>
          {report.client.age || report.client.gender ?
            <div className="pi-item">
              <label>Age / Sex</label>
              <span>
                {[
                  report.client.age ? `${report.client.age} Yrs` : "",
                  report.client.gender ? genderLabel(report.client.gender) : "",
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
            </div>
          : null}
          {report.client.location ?
            <div className="pi-item">
              <label>Location</label>
              <span>{report.client.location}</span>
            </div>
          : null}
          <div className="pi-item">
            <label>Date</label>
            <span>{current?.assessmentDate || report.reportDate || "-"}</span>
          </div>
        </div>
      </div>
      <div className="stat-row">
        {shownBmi != null ?
          <div className={`stat-card ${tone.color}`}>
            <div className="stat-label">Classification</div>
            <div className={`stat-value ${tone.color}`}>
              {report.bmiCategory || tone.label}
            </div>
            <div className="stat-sub">{tone.sub}</div>
          </div>
        : null}
        {shownBmi != null ?
          <div className={`stat-card ${tone.color}`}>
            <div className="stat-label">Current BMI</div>
            <div className={`stat-value ${tone.color}`}>{fmt(shownBmi, 2)}</div>
            <div className="stat-sub">Range: 18.5–24.9 normal</div>
          </div>
        : null}
        {current?.bodyFatPct != null ?
          <div className={`stat-card ${fat.color}`}>
            <div className="stat-label">Body Fat %</div>
            <div className={`stat-value ${fat.color}`}>
              {current?.bodyFatPct != null ?
                `${fmt(current.bodyFatPct, 2)}%`
              : "-"}
            </div>
            <div className="stat-sub">{fat.norm}</div>
          </div>
        : null}
        {report.targetWeight != null ?
          <div className="stat-card ok">
            <div className="stat-label">Target Weight</div>
            <div className="stat-value ok">{fmt(report.targetWeight, 2)}</div>
            <div className="stat-sub">kg to achieve</div>
          </div>
        : null}
        {delta != null ?
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
                "-"
              : `${needsToLose ? "−" : "+"}${Math.abs(delta).toFixed(1)}`}
            </div>
            <div className="stat-sub">kg total goal</div>
          </div>
        : null}
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
                    <td colSpan={9}>Past History</td>
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
      <BmiProgressGraph current={current} history={report.history} />
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

function BmiProgressGraph({
  current,
  history,
}: {
  current?: BmiMeasurement;
  history?: BmiMeasurement[];
}) {
  const rows = [
    ...(history ?? []).slice().reverse(),
    ...(current ? [current] : []),
  ]
    .filter((r) => Number.isFinite(r.weight) || Number.isFinite(r.bmi))
    .slice(-8);
  if (rows.length < 2) {
    return (
      <div className="table-card">
        <div className="card-header">
          <h2>Progress Graph</h2>
        </div>
        <ListEmpty
          title="Add another check-up to see progress."
          icon="fas fa-chart-line"
        />
      </div>
    );
  }
  const W = 640;
  const H = 220;
  const padX = 48;
  const padTop = 28;
  const padBottom = 58;
  const x = (i: number) => padX + (i * (W - padX * 2)) / (rows.length - 1);
  const series = (key: "weight" | "bmi") => {
    const values = rows.map((r) => r[key]);
    const nums = values.filter((v): v is number => Number.isFinite(v));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || 1;
    return values.map((v, i) =>
      Number.isFinite(v) ?
        {
          x: x(i),
          y:
            padTop +
            (1 - ((v as number) - min) / span) * (H - padTop - padBottom),
          v: v as number,
        }
      : null,
    );
  };
  const weight = series("weight");
  const bmi = series("bmi");
  const path = (pts: ({ x: number; y: number } | null)[]) =>
    pts
      .filter((p): p is { x: number; y: number; v: number } => p != null)
      .map(
        (p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`,
      )
      .join(" ");
  return (
    <div className="table-card">
      <div className="card-header">
        <h2>Progress Graph</h2>
        <div className="tag">Weight &amp; BMI</div>
      </div>
      <div style={{ padding: "12px 16px 16px" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Weight and BMI across check-ups"
          style={{ width: "100%", height: "auto" }}
        >
          <path
            d={path(weight)}
            fill="none"
            stroke="#1d4ed8"
            strokeWidth={2.5}
          />
          <path
            d={path(bmi)}
            fill="none"
            stroke="#c9882a"
            strokeWidth={2.5}
            strokeDasharray="6 5"
          />
          {weight.map((p, i) =>
            p ?
              <g key={`w${i}`}>
                <circle cx={p.x} cy={p.y} r={4} fill="#1d4ed8" />
                <text
                  x={p.x}
                  y={p.y - 9}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#1d4ed8"
                >
                  {p.v.toFixed(1)}
                </text>
              </g>
            : null,
          )}
          {bmi.map((p, i) =>
            p ?
              <g key={`b${i}`}>
                <circle cx={p.x} cy={p.y} r={4} fill="#c9882a" />
                <text
                  x={p.x}
                  y={p.y - 22}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#c9882a"
                >
                  {p.v.toFixed(1)}
                </text>
              </g>
            : null,
          )}
          {rows.map((r, i) => (
            <text
              key={`d${i}`}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#8b6553"
            >
              {r.assessmentDate ?? ""}
            </text>
          ))}
        </svg>
        <div
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "center",
            fontSize: 12,
            color: "#8b6553",
          }}
        >
          <span>
            <i className="fas fa-minus" style={{ color: "#1d4ed8" }} /> Weight
            (kg)
          </span>
          <span>
            <i className="fas fa-ellipsis-h" style={{ color: "#c9882a" }} /> BMI
          </span>
        </div>
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
