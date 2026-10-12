"use client";

import { useState } from "react";
import Image from "next/image";

import { COACH_PHOTO_FALLBACK, resolveMediaUrl } from "@/lib/media/media-url";

type CoachPhotoProps = {
  /** Prefer a URL already passed through `resolveCoachPhotoUrl` / `resolveMediaUrl`. */
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Safety: if a caller still passes a relative `/document/…` path, join it to
 * the API origin here so next/image never requests it against the Next host.
 */
function ensurePhotoSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return COACH_PHOTO_FALLBACK;

  if (trimmed.startsWith("/document/") || trimmed.startsWith("document/")) {
    return resolveMediaUrl(trimmed) || COACH_PHOTO_FALLBACK;
  }

  return trimmed;
}

/**
 * next/image wrapper that falls back to a local avatar when the remote
 * document URL fails (missing file, bad host, etc.).
 */
export function CoachPhoto({
  src,
  alt,
  fill = true,
  className,
  sizes,
  priority,
}: CoachPhotoProps) {
  const resolved = ensurePhotoSrc(src);
  const [current, setCurrent] = useState(resolved);
  const [trackedSrc, setTrackedSrc] = useState(resolved);
  if (resolved !== trackedSrc) {
    setTrackedSrc(resolved);
    setCurrent(resolved);
  }
  // Local API is http + port; skip optimizer so the browser hits the API origin directly.
  const isLocalHttp = current.startsWith("http://");

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={isLocalHttp}
      onError={() => {
        if (current !== COACH_PHOTO_FALLBACK) {
          setCurrent(COACH_PHOTO_FALLBACK);
        }
      }}
    />
  );
}
