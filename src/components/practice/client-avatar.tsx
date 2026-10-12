"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { Camera } from "lucide-react";

import { listDocuments, uploadDocument } from "@/lib/api/document";
import {
  fileToBase64DataUrl,
  REGISTER_IMAGE_ACCEPT,
  validateRegisterImage,
} from "@/lib/media/image-file";
import { COACH_PHOTO_FALLBACK, resolveMediaUrl } from "@/lib/media/media-url";
import {
  CLIENT_PROFILE_DOC_TYPE,
  CLIENT_PROFILE_REF_TYPE,
} from "@/types/document";

type ClientAvatarProps = {
  coachCode: string;
  clientCode: string;
  savedBy: number;
  onError?: (message: string | null) => void;
};

export function ClientAvatar({
  coachCode,
  clientCode,
  savedBy,
  onError,
}: ClientAvatarProps) {
  const inputId = useId();
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!coachCode || !clientCode) return;
    setLoading(true);
    try {
      const list = await listDocuments({
        coachCode,
        refCode: clientCode,
        refType: CLIENT_PROFILE_REF_TYPE,
        docType: CLIENT_PROFILE_DOC_TYPE,
      });
      const newest = list.reduce<(typeof list)[number] | null>(
        (best, item) => (!best || item.docId > best.docId ? item : best),
        null,
      );
      setPhotoUrl(newest ? resolveMediaUrl(newest.filePath) : "");
    } catch {
      setPhotoUrl("");
    } finally {
      setLoading(false);
    }
  }, [coachCode, clientCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [reload]);

  async function onPick(file: File | null) {
    if (!file) return;
    onError?.(null);
    const invalid = validateRegisterImage(file);
    if (invalid) {
      onError?.(invalid.message);
      return;
    }
    setBusy(true);
    try {
      const base64DataUrl = await fileToBase64DataUrl(file);
      await uploadDocument({
        base64DataUrl,
        coachCode,
        refCode: clientCode,
        refType: CLIENT_PROFILE_REF_TYPE,
        docType: CLIENT_PROFILE_DOC_TYPE,
        savedBy,
      });
      await reload();
    } catch (err) {
      onError?.(
        err instanceof Error ? err.message : "Could not upload client photo.",
      );
    } finally {
      setBusy(false);
    }
  }

  const src = photoUrl || COACH_PHOTO_FALLBACK;

  return (
    <div className="relative shrink-0">
      <div className="relative size-20 overflow-hidden rounded-full bg-paper-elevated ring-2 ring-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={`h-full w-full object-cover ${loading || busy ? "opacity-60" : ""}`}
        />
      </div>
      <label
        htmlFor={inputId}
        className={`absolute -right-0.5 -bottom-0.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-mc-header-bottom text-white shadow ${
          busy ? "pointer-events-none opacity-60" : "hover:opacity-90"
        }`}
        title="Upload client photo"
      >
        <Camera className="size-3.5" aria-hidden />
        <span className="sr-only">Upload client photo</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={REGISTER_IMAGE_ACCEPT}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          void onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
