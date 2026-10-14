"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { MenuSelect } from "@/components/ui/menu-select";
import { submitBmiLead } from "@/lib/api/coach";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";

type BmiResult = {
  bmi: string;
  label: string;
  color: string;
  explain: string;
  degrees: number;
  gender: string;
  age: number | null;
  heightCm: number;
  weightKg: number;
};

const EXPLAINS: Record<string, (bmi: string) => string> = {
  Underweight: (bmi) =>
    `Your BMI of ${bmi} is below the healthy range. This may indicate insufficient nutrition or low muscle mass. A certified nutrition or fitness coach can help you build a healthier body weight safely.`,
  "Healthy Weight": (bmi) =>
    `Great news! Your BMI of ${bmi} is within the healthy range. A wellness or yoga coach can help you maintain this long-term and optimise your energy and fitness.`,
  Overweight: (bmi) =>
    `Your BMI of ${bmi} is above the healthy range. Even modest weight loss of 5–10% can significantly reduce health risks. A weight management or lifestyle coach can create a practical, sustainable plan for you.`,
  Obese: (bmi) =>
    `Your BMI of ${bmi} indicates obesity, which carries significant health risks. A certified weight management or nutrition coach with a structured plan can make a real, life-changing difference.`,
};

export function HomeBmi() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<BmiResult | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [leadError, setLeadError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function calculate() {
    const errors: string[] = [];
    let cm = 0;
    if (unit === "cm") {
      cm = Number.parseFloat(heightCm);
      if (!cm || cm < 100 || cm > 250) {
        errors.push("Please enter a valid height between 100 and 250 cm.");
      }
    } else {
      const ft = Number.parseFloat(heightFt);
      const inches = Number.parseFloat(heightIn) || 0;
      if (!ft || ft < 1 || ft > 8 || inches < 0 || inches > 11) {
        errors.push("Please enter a valid height (feet: 1–8, inches: 0–11).");
      } else {
        cm = (ft * 12 + inches) * 2.54;
      }
    }
    const kg = Number.parseFloat(weight);
    if (!kg || kg < 20 || kg > 300) {
      errors.push("Please enter a valid weight between 20 and 300 kg.");
    }
    if (errors.length || !cm || !kg) {
      window.alert(errors.join("\n"));
      return;
    }

    const bmi = (kg / (cm / 100) ** 2).toFixed(1);
    const value = Number.parseFloat(bmi);
    const label =
      value < 18.5 ? "Underweight"
      : value < 25 ? "Healthy Weight"
      : value < 30 ? "Overweight"
      : "Obese";
    const color =
      label === "Underweight" ? "#3b82f6"
      : label === "Healthy Weight" ? "#22c55e"
      : label === "Overweight" ? "#f59e0b"
      : "#ef4444";
    const degrees = ((Math.max(16, Math.min(40, value)) - 16) / 24) * 180 - 90;
    const parsedAge = Number.parseInt(age, 10);

    setSent(false);
    setLeadName("");
    setLeadMobile("");
    setLeadError("");
    setResult({
      bmi,
      label,
      color,
      explain: EXPLAINS[label]?.(bmi) ?? "",
      degrees,
      gender,
      age: Number.isFinite(parsedAge) ? parsedAge : null,
      heightCm: cm,
      weightKg: kg,
    });

    window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function submitLead() {
    const name = leadName.trim();
    const mobile = leadMobile.trim();
    if (!name) {
      setLeadError("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setLeadError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!result) return;
    setSending(true);
    setLeadError("");
    try {
      const response = await submitBmiLead({
        clientName: name,
        clientMobile: mobile,
        gender: result.gender || undefined,
        age: result.age,
        heightCm: result.heightCm,
        weightKg: result.weightKg,
        bmiValue: Number.parseFloat(result.bmi),
        bmiCategory: result.label,
      });
      if (isApiSuccess(response)) {
        setSent(true);
      } else {
        setLeadError(
          firstApiError(response) || "Something went wrong. Please try again.",
        );
      }
    } catch {
      setLeadError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bmi-teaser" id="bmi">
      <div className="container">
        <div className="bmi-grid">
          <div className="bmi-content">
            <div
              className="section-tag"
              style={{ background: "#fdf3e0", color: "#c9882a" }}
            >
              <i className="fas fa-calculator" /> Free Health Tool
            </div>
            <h2 className="section-title">
              Know Your BMI,
              <br />
              Know Your Health
            </h2>
            <p className="section-subtitle">
              Use our free BMI calculator to understand your health baseline and
              get connected with the right coach for your wellness goals.
            </p>
            <div className="bmi-features">
              <div className="bmi-feature">
                <i className="fas fa-tachometer-alt" />
                <span>Instant BMI calculation with health category</span>
              </div>
              <div className="bmi-feature">
                <i className="fas fa-lightbulb" />
                <span>Personalized wellness suggestions based on results</span>
              </div>
              <div className="bmi-feature">
                <i className="fas fa-user-md" />
                <span>Connect with the right coach immediately after</span>
              </div>
              <div className="bmi-feature">
                <i className="fas fa-lock" />
                <span>100% private and secure — no data stored</span>
              </div>
            </div>
          </div>
          <div className="bmi-calculator">
            <h3>
              <i
                className="fas fa-heartbeat"
                style={{ color: "var(--gold)", marginRight: 8 }}
              />{" "}
              BMI Calculator
            </h3>
            <p>Enter your details for an instant health check</p>
            <div className="bmi-form">
              <div className="form-group">
                <label htmlFor="bmi-gender">Gender</label>
                <MenuSelect
                  id="bmi-gender"
                  aria-label="Select Gender"
                  skin="public"
                  className="ui-select"
                  value={gender}
                  placeholder="Select Gender"
                  options={[
                    { value: "", label: "Select Gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  onChange={(event) => setGender(event.target.value)}
                />
              </div>
              <div className="bmi-row">
                <div className="form-group">
                  <label htmlFor="bmi-age">Age</label>
                  <input
                    type="number"
                    id="bmi-age"
                    placeholder="Years"
                    min={5}
                    max={100}
                    aria-label="Years"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={unit === "cm" ? "bmi-height" : "bmi-height-ft"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    Height
                    <span className="bmi-ht-toggle">
                      <button
                        type="button"
                        id="btnHtCm"
                        className={
                          unit === "cm" ?
                            "bmi-ht-btn bmi-ht-active"
                          : "bmi-ht-btn"
                        }
                        onClick={() => setUnit("cm")}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        id="btnHtFt"
                        className={
                          unit === "ft" ?
                            "bmi-ht-btn bmi-ht-active"
                          : "bmi-ht-btn"
                        }
                        onClick={() => setUnit("ft")}
                      >
                        ft / in
                      </button>
                    </span>
                  </label>
                  {unit === "cm" ?
                    <div id="bmiHtCm">
                      <input
                        type="number"
                        id="bmi-height"
                        placeholder="e.g. 165"
                        min={100}
                        max={250}
                        aria-label="e.g. 165"
                        style={{ width: "100%" }}
                        value={heightCm}
                        onChange={(event) => setHeightCm(event.target.value)}
                      />
                    </div>
                  : <div id="bmiHtFt" className="bmi-ht-ft-row">
                      <input
                        type="number"
                        id="bmi-height-ft"
                        placeholder="ft"
                        min={1}
                        max={8}
                        aria-label="Feet"
                        value={heightFt}
                        onChange={(event) => setHeightFt(event.target.value)}
                      />
                      <input
                        type="number"
                        id="bmi-height-in"
                        placeholder="in"
                        min={0}
                        max={11}
                        aria-label="Inches"
                        value={heightIn}
                        onChange={(event) => setHeightIn(event.target.value)}
                      />
                    </div>
                  }
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="bmi-weight">Weight (kg)</label>
                <input
                  type="number"
                  id="bmi-weight"
                  placeholder="e.g. 70"
                  min={20}
                  max={300}
                  aria-label="e.g. 70"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-gold"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={calculate}
              >
                <i className="fas fa-calculator" /> Calculate My BMI
              </button>
            </div>
          </div>
        </div>

        {result ?
          <div className="bmi-result-panel" id="bmiResult" ref={panelRef}>
            <div className="bmi-result-inner">
              <div className="bmi-res-left">
                <div className="bmi-gauge-wrap">
                  <svg
                    viewBox="-50 -5 420 220"
                    className="bmi-gauge-svg"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 40 160 A 120 120 0 0 1 42.8 119.6"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="22"
                    />
                    <path
                      d="M 42.8 119.6 A 120 120 0 0 1 114.5 49.8"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="22"
                    />
                    <path
                      d="M 114.5 49.8 A 120 120 0 0 1 191.1 44.1"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="22"
                    />
                    <path
                      d="M 191.1 44.1 A 120 120 0 0 1 280 160"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="22"
                    />
                    <text
                      x="26"
                      y="178"
                      textAnchor="middle"
                      className="bmi-gauge-lbl"
                    >
                      16
                    </text>
                    <text
                      x="22"
                      y="112"
                      textAnchor="end"
                      className="bmi-gauge-lbl"
                    >
                      18.5
                    </text>
                    <text
                      x="107"
                      y="27"
                      textAnchor="middle"
                      className="bmi-gauge-lbl"
                    >
                      25
                    </text>
                    <text
                      x="196"
                      y="21"
                      textAnchor="middle"
                      className="bmi-gauge-lbl"
                    >
                      30
                    </text>
                    <text
                      x="293"
                      y="178"
                      textAnchor="middle"
                      className="bmi-gauge-lbl"
                    >
                      40
                    </text>
                    <text
                      x="-10"
                      y="148"
                      textAnchor="middle"
                      className="bmi-zone-lbl"
                      fill="#3b82f6"
                    >
                      Under-
                    </text>
                    <text
                      x="-10"
                      y="162"
                      textAnchor="middle"
                      className="bmi-zone-lbl"
                      fill="#3b82f6"
                    >
                      weight
                    </text>
                    <text
                      x="55"
                      y="48"
                      textAnchor="middle"
                      className="bmi-zone-lbl"
                      fill="#22c55e"
                    >
                      Normal
                    </text>
                    <text
                      x="160"
                      y="10"
                      textAnchor="middle"
                      className="bmi-zone-lbl"
                      fill="#f59e0b"
                    >
                      Overweight
                    </text>
                    <text
                      x="271"
                      y="55"
                      textAnchor="middle"
                      className="bmi-zone-lbl"
                      fill="#ef4444"
                    >
                      Obese
                    </text>
                    <line
                      x1="160"
                      y1="160"
                      x2="160"
                      y2="55"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{
                        transformOrigin: "160px 160px",
                        transform: `rotate(${result.degrees}deg)`,
                        transition: "transform 1s cubic-bezier(.4,0,.2,1)",
                      }}
                    />
                    <circle cx="160" cy="160" r="7" fill="white" />
                    <text
                      x="160"
                      y="132"
                      textAnchor="middle"
                      className="bmi-gauge-num"
                    >
                      {result.bmi}
                    </text>
                    <text
                      x="160"
                      y="148"
                      textAnchor="middle"
                      className="bmi-gauge-unit"
                    >
                      BMI
                    </text>
                  </svg>
                </div>
              </div>
              <div className="bmi-res-right">
                <div
                  className="bmi-res-headline"
                  style={{ color: result.color }}
                >
                  BMI {result.bmi} — {result.label}
                </div>
                <p className="bmi-res-explain">{result.explain}</p>
                {sent ?
                  <div className="bmi-lead-success">
                    <i
                      className="fas fa-check-circle"
                      style={{
                        color: "#22c55e",
                        fontSize: 28,
                        marginBottom: 10,
                      }}
                    />
                    <p>
                      Thank you! A top-rated wellness coach will contact you
                      shortly.
                    </p>
                    <Link
                      href="/coach"
                      className="btn btn-gold bmi-lead-btn"
                      style={{ marginTop: 12 }}
                    >
                      <i className="fas fa-search" /> Browse All Coaches
                    </Link>
                  </div>
                : <div className="bmi-lead-form">
                    <p className="bmi-lead-prompt">
                      Get personalised guidance — share your details and a
                      top-rated wellness coach will reach out.{" "}
                      <strong>Free. No commitments.</strong>
                    </p>
                    <div className="bmi-lead-fields">
                      <input
                        type="text"
                        placeholder="Your Name"
                        maxLength={100}
                        className="bmi-lead-input"
                        aria-label="Your Name"
                        value={leadName}
                        onChange={(event) => setLeadName(event.target.value)}
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        maxLength={10}
                        className="bmi-lead-input"
                        aria-label="Mobile Number"
                        value={leadMobile}
                        onChange={(event) => setLeadMobile(event.target.value)}
                      />
                    </div>
                    {leadError ?
                      <div className="bmi-lead-msg bmi-lead-msg-error">
                        {leadError}
                      </div>
                    : null}
                    <button
                      type="button"
                      className="btn btn-gold bmi-lead-btn"
                      disabled={sending}
                      onClick={() => void submitLead()}
                    >
                      {sending ?
                        <>
                          <i className="fas fa-spinner fa-spin" /> Sending...
                        </>
                      : <>
                          <i className="fas fa-comments" /> Discuss Your BMI
                          with Top Rated Coaches
                        </>
                      }
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        : null}
      </div>
    </section>
  );
}
