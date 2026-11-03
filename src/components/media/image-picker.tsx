"use client";

import { useId } from "react";

import { CoachPhoto } from "@/components/coach-photo";
import { REGISTER_IMAGE_ACCEPT } from "@/constants/media";
import { resolveMediaUrl } from "@/lib/media/media-url";

export type PickedImage = {
  file: File;
  previewUrl: string;
};

type ImagePickerProps = {
  label: string;
  hint?: string;
  value: PickedImage | null;
  /** Existing remote URL when no new file is picked. */
  currentUrl?: string | null;
  /** Initials when the current photo 404s. */
  name?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  aspectClassName?: string;
};

export function ImagePicker({
  label,
  hint = "JPG, PNG, or WebP · max 5 MB",
  value,
  currentUrl,
  name,
  onChange,
  disabled,
  aspectClassName = "h-16 w-16",
}: ImagePickerProps) {
  const inputId = useId();
  const remote = resolveMediaUrl(currentUrl);
  const preview = value?.previewUrl || remote || "";

  return (
    <div className="block">
      <span className="mc-field-label">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl bg-mc-secondary-light/40 ring-1 ring-mc-secondary/15 ${aspectClassName}`}
        >
          {preview ?
            <CoachPhoto
              src={preview}
              alt={name?.trim() ? `${name.trim()} photo` : label}
              name={name}
              className="object-cover"
              sizes="64px"
            />
          : <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold tracking-wide text-mc-secondary uppercase">
              Add
            </span>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">
            {value ?
              value.file.name
            : remote ?
              "Current image"
            : "No file chosen"}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full bg-mc-secondary px-4 text-xs font-semibold text-white ${
                disabled ? "pointer-events-none opacity-60" : "hover:opacity-90"
              }`}
            >
              Choose
            </label>
            {value ?
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold text-mc-destructive hover:underline disabled:opacity-60"
              >
                Clear
              </button>
            : null}
          </div>
          <input
            id={inputId}
            type="file"
            accept={REGISTER_IMAGE_ACCEPT}
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              onChange(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}
