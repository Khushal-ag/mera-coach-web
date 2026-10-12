"use client";

import { useMemo, useState } from "react";

import { CheckCircle2 } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { firstApiError, isApiSuccess, submitBmiLead } from "@/lib/api";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";

/**
 * Public BMI calculator + lead form.
 * App PublicBmiScreen collects name/mobile only; web adds client-side BMI math
 * (same thresholds as app `utils/bmi`) and posts optional measurement fields
 * to `POST /v1/Coach/bmi-lead`.
 */
export function BmiCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const bmi = useMemo(() => getBmi(height, weight), [height, weight]);
  const category = useMemo(() => getBmiCategory(bmi), [bmi]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim().replace(/\D/g, "");
    if (!trimmedName) {
      setBanner("Name is required.");
      setSuccess(false);
      return;
    }
    if (trimmedMobile.length !== 10) {
      setBanner("Enter a valid 10-digit mobile number.");
      setSuccess(false);
      return;
    }

    setSubmitting(true);
    setBanner(null);
    try {
      const heightCm = parseFloat(height);
      const weightKg = parseFloat(weight);
      const res = await submitBmiLead({
        clientName: trimmedName,
        clientMobile: trimmedMobile,
        ...(Number.isFinite(heightCm) && heightCm > 0 ? { heightCm } : {}),
        ...(Number.isFinite(weightKg) && weightKg > 0 ? { weightKg } : {}),
        ...(bmi != null && bmi > 0 ? { bmiValue: Number(bmi.toFixed(1)) } : {}),
        ...(category ? { bmiCategory: category.label } : {}),
      });
      if (!isApiSuccess(res)) {
        setBanner(firstApiError(res) ?? "Could not submit your details.");
        setSuccess(false);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setBanner(
        err instanceof Error ?
          err.message
        : "Could not submit your details. Please try again.",
      );
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  const categoryTone =
    category?.tone === "secondary" ?
      "bg-[color:var(--mc-secondary-light)] text-[color:var(--mc-secondary-dark)]"
    : category?.tone === "primary" ?
      "bg-[color:var(--mc-primary-light)] text-[color:var(--mc-primary)]"
    : "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10">
      <div className="mc-panel p-5 sm:p-7">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
          Calculate BMI
        </h2>
        <p className="mt-2 max-w-[40ch] text-sm text-ink-muted">
          Enter height and weight for an instant result. Nothing is stored until
          you request a coach callback.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Height (cm)"
            type="number"
            inputMode="decimal"
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              setSuccess(false);
            }}
            placeholder="e.g. 170"
          />
          <TextField
            label="Weight (kg)"
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setSuccess(false);
            }}
            placeholder="e.g. 68"
          />
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-ink-muted">Your BMI</p>
            {bmi != null ?
              <p className="mt-1 font-display text-4xl font-bold tracking-tight text-ink tabular-nums sm:text-5xl">
                {formatBmi(bmi)}
              </p>
            : <p className="mt-1 text-sm text-ink-muted">
                Waiting for measurements
              </p>
            }
          </div>
          {category ?
            <p
              className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${categoryTone}`}
            >
              {category.label}
            </p>
          : null}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-4 text-xs sm:grid-cols-4">
          {[
            { label: "Underweight", range: "< 18.5" },
            { label: "Normal", range: "18.5-24.9" },
            { label: "Overweight", range: "25-29.9" },
            { label: "Obese", range: "30+" },
          ].map((row) => (
            <div key={row.label}>
              <dt className="font-semibold text-ink">{row.label}</dt>
              <dd className="text-ink-muted">{row.range}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="mc-panel p-5 sm:p-7">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
          Talk to a coach
        </h2>
        <p className="mt-2 max-w-[40ch] text-sm text-ink-muted">
          Leave your name and mobile. A coach will call you back. Free, no
          commitment.
        </p>

        {banner ?
          <AlertBanner tone="error" className="mt-4">
            {banner}
          </AlertBanner>
        : null}
        {success ?
          <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[color:var(--mc-secondary-light)] p-3 text-sm font-medium text-[color:var(--mc-secondary-dark)]">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            Thanks! A coach will reach out shortly.
          </div>
        : null}

        <div className="mt-5 space-y-4">
          <TextField
            label="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setBanner(null);
              setSuccess(false);
            }}
            placeholder="Your full name"
            required
            autoComplete="name"
          />
          <TextField
            label="Mobile number"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              setBanner(null);
              setSuccess(false);
            }}
            placeholder="10-digit mobile number"
            inputMode="tel"
            required
            autoComplete="tel"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mc-btn-primary mt-6 w-full"
        >
          {submitting ? "Sending…" : "Request a callback"}
        </button>
      </form>
    </div>
  );
}
