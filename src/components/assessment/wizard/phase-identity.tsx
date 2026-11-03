"use client";

import { useEffect, useMemo } from "react";

import type { WizardController } from "./use-assessment-wizard";

import { PhotoGallery } from "@/components/practice/photo-gallery";
import { SelectField, TextField } from "@/components/ui/field";
import {
  CLIENT_PROGRESS_DOC_TYPE,
  CLIENT_PROGRESS_REF_TYPE,
} from "@/constants/documents";
import { getSession } from "@/lib/auth/session";
import { toApiDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { CLIENT_PROFILE_PHOTO_REQUIRED } from "@/lib/validation";

function ClientProfilePhotoPicker({
  preview,
  displayUrl,
  photoFile,
  pickPhoto,
  hint,
  showRemove,
  photoError,
}: {
  preview: string | null;
  displayUrl: string | null;
  photoFile: File | null;
  pickPhoto: (file: File | null) => void;
  hint: string;
  showRemove: boolean;
  photoError: boolean;
}) {
  return (
    <div id="client-profile-photo" className="space-y-2">
      <label
        htmlFor="clientPhoto"
        className="mb-1.5 block text-sm font-semibold text-ink"
      >
        Client profile photo <span className="text-red-600">*</span>
      </label>
      <p className="text-xs text-ink-muted">{hint}</p>
      <div className="flex items-center gap-4">
        <label
          htmlFor="clientPhoto"
          className="block cursor-pointer"
          aria-hidden
        >
          {displayUrl ?
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayUrl}
              alt="Client profile"
              className={cn(
                "size-24 rounded-2xl border object-cover",
                photoError ? "border-red-500" : "border-line",
              )}
            />
          : <div
              className={cn(
                "flex size-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed bg-paper-elevated transition hover:bg-white",
                photoError ?
                  "border-red-400 text-red-600"
                : "border-mc-accent/50 text-mc-accent",
              )}
            >
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
            {photoFile || preview ?
              "Change photo"
            : displayUrl ?
              "Change profile photo"
            : "Upload photo"}
          </label>
          {showRemove && photoFile ?
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
  );
}

export function PhaseIdentity({ wizard }: { wizard: WizardController }) {
  const {
    patch,
    form,
    onDobChange,
    ids,
    coachCode,
    photoFile,
    pickPhoto,
    existingProfilePhotoUrl,
    error,
  } = wizard;
  const preview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile],
  );
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const photoError = error === CLIENT_PROFILE_PHOTO_REQUIRED;
  const savedBy = getSession()?.coachId ?? 0;
  const checkupProfileUrl = preview ?? existingProfilePhotoUrl;

  return (
    <div className="space-y-6">
      {!ids.clientCode ?
        <ClientProfilePhotoPicker
          preview={preview}
          displayUrl={preview}
          photoFile={photoFile}
          pickPhoto={pickPhoto}
          photoError={photoError}
          showRemove
          hint="Saved as the client's profile picture and as their first progress photo. JPG, PNG or WebP, up to 5 MB."
        />
      : null}

      {ids.clientCode ?
        <>
          <ClientProfilePhotoPicker
            preview={preview}
            displayUrl={checkupProfileUrl}
            photoFile={photoFile}
            pickPhoto={pickPhoto}
            photoError={photoError}
            showRemove={Boolean(photoFile)}
            hint="Used as the client's avatar in your client list. This is not the same as progress photos — add those separately below."
          />
          {coachCode ?
            <PhotoGallery
              coachCode={coachCode}
              refCode={ids.clientCode}
              refType={CLIENT_PROGRESS_REF_TYPE}
              docType={CLIENT_PROGRESS_DOC_TYPE}
              savedBy={savedBy}
              maxPhotos={24}
              title="Progress photos"
              showDates
              emptyHint="Upload progress photos for this visit."
            />
          : null}
        </>
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
