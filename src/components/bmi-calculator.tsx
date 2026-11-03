"use client";

import { useMemo, useState } from "react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { TextField } from "@/components/ui/field";
import { submitBmiLead } from "@/lib/api/coach";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { formatBmi, getBmi, getBmiCategory } from "@/lib/bmi";
import { isValidMobile } from "@/lib/validation";

/**
 * Public BMI calculator + lead form.
 * App PublicBmiScreen collects name/mobile only; web adds client-side BMI math
 * (same thresholds as app `utils/bmi`) and posts optional measurement fields
 * to `POST /Coach/bmi-lead`.
 */
export function BmiCalculator({
  layout = "split",
}: {
  /** split: calculator and callback side by side. stack: one column for the home band. */
  layout?: "split" | "stack";
} = {}) {
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
    if (!isValidMobile(trimmedMobile)) {
      setBanner(
        "Please enter a valid 10-digit mobile number (starting with 6-9).",
      );
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
      "bg-[color:var(--mc-secondary-light)] text-mc-secondary"
    : category?.tone === "primary" ?
      "bg-[color:var(--mc-primary-light)] text-[color:var(--mc-primary)]"
    : "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]";

  return (
    <div
      className={
        layout === "stack" ? "grid gap-6" : (
          "grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10"
        )
      }
    >
      <div className="rounded-[var(--radius-lg)] bg-mc-secondary p-5 text-white shadow-[0_20px_60px_rgba(27,67,50,0.35)] sm:p-7">
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">
          Calculate BMI
        </h2>
        <p className="mt-2 max-w-[40ch] text-sm text-white/80">
          Enter height and weight for an instant result. Nothing is stored until
          you request a coach callback.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField
            tone="dark"
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
            tone="dark"
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

        <div className="mt-6 flex flex-col items-start gap-3 border-t border-white/15 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-[11px] font-bold tracking-wide text-white/85 uppercase">
              Your BMI
            </p>
            {bmi != null ?
              <>
                <p
                  className={
                    success ?
                      "mt-1 font-display text-5xl font-extrabold tracking-tight text-[color:var(--mc-accent)] tabular-nums"
                    : "mt-1 font-display text-5xl font-extrabold tracking-tight text-white/35 tabular-nums"
                  }
                  aria-label={success ? undefined : "Locked"}
                >
                  {success ? formatBmi(bmi) : "–.–"}
                </p>
                {success ? null : (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/85">
                    <i className="fas fa-lock" aria-hidden /> Enter your details
                    in the form to unlock your result.
                  </p>
                )}
              </>
            : <p className="mt-1 text-sm text-white/80">
                Waiting for measurements
              </p>
            }
          </div>
          {category && success ?
            <p
              className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${categoryTone}`}
            >
              {category.label}
            </p>
          : null}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/15 pt-4 text-xs">
          {[
            { label: "Underweight", range: "< 18.5" },
            { label: "Normal", range: "18.5-24.9" },
            { label: "Overweight", range: "25-29.9" },
            { label: "Obese", range: "30+" },
          ].map((row) => (
            <div key={row.label}>
              <dt className="font-semibold text-white/85">{row.label}</dt>
              <dd className="text-white/75">{row.range}</dd>
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
          <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[color:var(--mc-secondary-light)] p-3 text-sm font-medium text-mc-secondary">
            <i
              className="fas fa-check-circle"
              style={{ fontSize: 20 }}
              aria-hidden
            />
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
          className="mc-btn-primary mc-btn-hero mt-6 w-full"
        >
          {submitting ? "Sending…" : "Request a callback"}
        </button>
      </form>
    </div>
  );
}
