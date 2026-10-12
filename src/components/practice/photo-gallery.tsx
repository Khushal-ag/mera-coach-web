"use client";

import { useCallback, useEffect, useState } from "react";

import { ImagePlus, Trash2 } from "lucide-react";

import type { DocumentListItem } from "@/types/document";

import { AlertBanner } from "@/components/ui/alert-banner";
import {
  deleteDocument,
  listDocuments,
  uploadDocument,
} from "@/lib/api/document";
import {
  fileToBase64DataUrl,
  REGISTER_IMAGE_ACCEPT,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { resolveMediaUrl } from "@/lib/media/media-url";

type PhotoGalleryProps = {
  coachCode: string;
  refCode: string;
  refType: "COACH" | "CLIENT";
  docType: string;
  savedBy: number;
  maxPhotos?: number;
  title?: string;
  emptyHint?: string;
};

export function PhotoGallery({
  coachCode,
  refCode,
  refType,
  docType,
  savedBy,
  maxPhotos = 12,
  title = "Photos",
  emptyHint = "No photos yet.",
}: PhotoGalleryProps) {
  const [items, setItems] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!coachCode || !refCode) return;
    setLoading(true);
    setError(null);
    try {
      const list = await listDocuments({
        coachCode,
        refCode,
        refType,
        docType,
      });
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load photos.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [coachCode, refCode, refType, docType]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    const remaining = maxPhotos - items.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxPhotos} photos.`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const batch = Array.from(files).slice(0, remaining);
      for (const file of batch) {
        const invalid = validateRegisterImage(file);
        if (invalid) throw new Error(invalid.message);
        const base64DataUrl = await fileToBase64DataUrl(file);
        await uploadDocument({
          base64DataUrl,
          coachCode,
          refCode,
          refType,
          docType: docType as
            | "LOGO"
            | "PROFILE_PIC"
            | "GALLERY"
            | "PACKAGE_IMAGE"
            | "EVENT_IMAGE"
            | "PROGRESS_PHOTO",
          savedBy,
        });
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(docId: number) {
    setBusy(true);
    setError(null);
    try {
      await deleteDocument({ docId, coachCode });
      setItems((prev) => prev.filter((p) => p.docId !== docId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-sm)] border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
        <label className="mc-btn-secondary !min-h-9 cursor-pointer px-3 text-sm">
          <ImagePlus className="size-4" aria-hidden />
          {busy ? "Working…" : "Upload"}
          <input
            type="file"
            accept={REGISTER_IMAGE_ACCEPT}
            multiple
            className="sr-only"
            disabled={busy || items.length >= maxPhotos}
            onChange={(e) => {
              void onUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="p-5">
        {error ?
          <AlertBanner tone="error">{error}</AlertBanner>
        : null}
        {loading ?
          <p className="text-sm text-ink-muted">Loading photos…</p>
        : items.length === 0 ?
          <p className="text-sm text-ink-muted">{emptyHint}</p>
        : <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => {
              const src = resolveMediaUrl(item.filePath);
              return (
                <li
                  key={item.docId}
                  className="group relative overflow-hidden rounded-[10px] border border-line bg-paper-elevated"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete photo"
                    disabled={busy}
                    onClick={() => void onDelete(item.docId)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                  {item.fcdt ?
                    <p className="truncate px-2 py-1.5 text-[11px] text-ink-muted">
                      {item.fcdt}
                    </p>
                  : null}
                </li>
              );
            })}
          </ul>
        }
      </div>
    </section>
  );
}
