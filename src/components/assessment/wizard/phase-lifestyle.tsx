"use client";

import type { WizardController } from "./use-assessment-wizard";

import { SelectField, TextAreaField } from "@/components/ui/field";

import { ChipMulti } from "./chip-multi";

export function PhaseLifestyle({ wizard }: { wizard: WizardController }) {
  const { patch, form, optionsFor } = wizard;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Food preference"
          required
          value={form.foodPreference}
          onChange={(e) => patch("foodPreference", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC001").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Regional cuisine"
          required
          value={form.regionalCuisine}
          onChange={(e) => patch("regionalCuisine", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC002").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Physical activity"
          required
          value={form.physicalActivity}
          onChange={(e) => patch("physicalActivity", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC003").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Work type"
          required
          value={form.workType}
          onChange={(e) => patch("workType", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC004").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Sleep duration"
          required
          value={form.sleepDuration}
          onChange={(e) => patch("sleepDuration", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC005").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Pregnancy / breastfeeding (optional)"
          value={form.pregnancy}
          onChange={(e) => patch("pregnancy", e.target.value)}
        >
          {optionsFor("PC006").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Primary goal (optional)"
          value={form.primaryGoal}
          onChange={(e) => patch("primaryGoal", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC007").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Target timeline (optional)"
          value={form.targetTimeline}
          onChange={(e) => patch("targetTimeline", e.target.value)}
        >
          <option value="">Select</option>
          {optionsFor("PC008").map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>
      <ChipMulti
        label="Medical conditions"
        required
        options={optionsFor("PC009")}
        values={form.medicalConditions}
        onChange={(v) => patch("medicalConditions", v)}
      />
      <ChipMulti
        label="Food allergies"
        required
        options={optionsFor("PC010")}
        values={form.foodAllergies}
        onChange={(v) => patch("foodAllergies", v)}
      />
      <TextAreaField
        label="Additional notes (optional)"
        value={form.additionalNotes}
        onChange={(e) => patch("additionalNotes", e.target.value)}
      />
    </div>
  );
}
