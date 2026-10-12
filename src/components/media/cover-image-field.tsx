"use client";

import { useId, useState } from "react";

import type { CoachDocType } from "@/types/document";

import { MediaPreview } from "@/components/media/media-preview";
import { uploadDocument } from "@/lib/api/document";
import {
  fileToBase64DataUrl,
  REGISTER_IMAGE_ACCEPT,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { resolveMediaUrl } from "@/lib/media/media-url";

type CoverImageFieldProps = {
  label?: string;
  imageUrl?: string;
  coachCode: string;
  savedBy: number;
  docType: Extract<CoachDocType, "PACKAGE_IMAGE" | "EVENT_IMAGE">;
  disabled?: boolean;
  onChange: (imageUrl: string) => void;
  onError?: (message: string) => void;
};

export function CoverImageField({
  label = "Cover image",
  imageUrl,
  coachCode,
  savedBy,
  docType,
  disabled,
  onChange,
  onError,
}: CoverImageFieldProps) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const preview = resolveMediaUrl(imageUrl);

  async function onPick(file: File | null) {
    if (!file || !coachCode) return;
    const invalid = validateRegisterImage(file);
    if (invalid) {
      onError?.(invalid.message);
      return;
    }
    const previous = imageUrl ?? "";
    const localPreview = URL.createObjectURL(file);
    onChange(localPreview);
    setBusy(true);
    try {
      const base64DataUrl = await fileToBase64DataUrl(file);
      const uploaded = await uploadDocument({
        base64DataUrl,
        coachCode,
        refCode: coachCode,
        refType: "COACH",
        docType,
        savedBy,
      });
      onChange(uploaded.url);
    } catch (err) {
      onChange(previous);
      onError?.(
        err instanceof Error ? err.message : "Could not upload cover image.",
      );
    } finally {
      URL.revokeObjectURL(localPreview);
      setBusy(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="mc-field-label">{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-paper-elevated ring-1 ring-line">
          {preview ?
            <MediaPreview src={preview} sizes="128px" />
          : <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-ink-muted uppercase">
              Cover
            </span>
          }
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-mc-header-bottom px-3 text-xs font-semibold text-white ${
              disabled || busy ?
                "pointer-events-none opacity-60"
              : "hover:opacity-90"
            }`}
          >
            {busy ?
              "Uploading…"
            : preview ?
              "Change"
            : "Upload"}
          </label>
          {preview ?
            <button
              type="button"
              disabled={disabled || busy}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-mc-destructive hover:underline disabled:opacity-60"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          : null}
        </div>
        <input
          id={inputId}
          type="file"
          accept={REGISTER_IMAGE_ACCEPT}
          disabled={disabled || busy}
          className="sr-only"
          onChange={(e) => {
            void onPick(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
