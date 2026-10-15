"use client";

import type { WizardController } from "./use-assessment-wizard";

import { SelectField, TextField } from "@/components/ui/field";
import { toApiDate } from "@/lib/dates";

export function PhaseIdentity({ wizard }: { wizard: WizardController }) {
  const { patch, form, onDobChange } = wizard;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Full name"
          required
          value={form.clientName}
          onChange={(e) => patch("clientName", e.target.value)}
        />
        <TextField
          label="Mobile"
          required
          inputMode="numeric"
          maxLength={10}
          value={form.mobileNo}
          onChange={(e) =>
            patch("mobileNo", e.target.value.replace(/\D/g, "").slice(0, 10))
          }
        />
        <TextField
          label="Email (optional)"
          type="email"
          value={form.emailId}
          onChange={(e) => patch("emailId", e.target.value)}
        />
        <TextField
          label="Location"
          required
          value={form.location}
          onChange={(e) => patch("location", e.target.value)}
        />
        <SelectField
          label="Gender"
          required
          value={form.gender}
          onChange={(e) => patch("gender", e.target.value)}
        >
          <option value="">Select</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </SelectField>
        <TextField
          label="Date of birth (optional)"
          type="date"
          value={toApiDate(form.dob) ?? ""}
          max={new Date().toISOString().slice(0, 10)}
          hint="Optional. Age fills in from Date of Birth."
          onChange={(e) => onDobChange(e.target.value)}
        />
        <TextField
          label="Age"
          required
          type="number"
          value={form.age}
          onChange={(e) => patch("age", e.target.value)}
        />
        <TextField
          label="Weight (kg)"
          type="number"
          step="0.1"
          required
          value={form.weight}
          onChange={(e) => patch("weight", e.target.value)}
        />
        <TextField
          label="Height (cm)"
          type="number"
          step="0.1"
          required
          value={form.height}
          onChange={(e) => patch("height", e.target.value)}
        />
      </div>
    </div>
  );
}
