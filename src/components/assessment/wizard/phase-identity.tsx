"use client";

import { useEffect, useMemo } from "react";

import type { WizardController } from "./use-assessment-wizard";

import { SelectField, TextField } from "@/components/ui/field";
import { toApiDate } from "@/lib/dates";

export function PhaseIdentity({ wizard }: { wizard: WizardController }) {
  const { patch, form, onDobChange, ids, photoFile, pickPhoto } = wizard;
  const preview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  return (
    <div className="space-y-4">
      {!ids.clientCode ?
        <div>
          <label
            htmlFor="clientPhoto"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Client photo <span className="text-red-600">*</span>
          </label>
          <p className="mb-2 text-xs text-ink-muted">
            Saved as the client&apos;s profile picture and as their first
            progress photo. JPG, PNG or WebP, up to 2 MB.
          </p>
          <div className="flex items-center gap-4">
            <label
              htmlFor="clientPhoto"
              className="block cursor-pointer"
              aria-hidden
            >
              {preview ?
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Selected client"
                  className="size-24 rounded-2xl border border-line object-cover"
                />
              : <div className="flex size-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-mc-accent/50 bg-paper-elevated text-mc-accent transition hover:bg-white">
                  <i className="fas fa-camera text-xl" />
                  <span className="text-[11px] font-semibold">Add photo</span>
                </div>
              }
            </label>
            <div className="flex flex-col items-start gap-2">
              <input
                id="clientPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="clientPhoto"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-mc-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition focus-within:ring-2 focus-within:ring-mc-accent/40 hover:opacity-90"
              >
                <i className="fas fa-upload" aria-hidden />
                {photoFile ? "Change photo" : "Upload photo"}
              </label>
              {photoFile ?
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span className="max-w-48 truncate">{photoFile.name}</span>
                  <button
                    type="button"
                    className="font-semibold text-red-600"
                    onClick={() => pickPhoto(null)}
                  >
                    Remove
                  </button>
                </div>
              : null}
            </div>
          </div>
        </div>
      : null}
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
