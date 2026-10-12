"use client";

import { useState } from "react";
import Image from "next/image";

import { resolveMediaUrl } from "@/lib/media/media-url";

type CoachPhotoProps = {
  /** Prefer a URL already passed through `resolveCoachPhotoUrl` / `resolveMediaUrl`. */
  src: string;
  alt: string;
  /** Used for initials when there is no photo. Omit for a generic outline. */
  name?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function isRetiredFaceFallback(src: string): boolean {
  return src.includes("coach-avatar-fallback");
}

/**
 * Safety: if a caller still passes a relative `/document/…` path, join it to
 * the API origin here so next/image never requests it against the Next host.
 */
function ensurePhotoSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || isRetiredFaceFallback(trimmed)) return "";

  if (trimmed.startsWith("/document/") || trimmed.startsWith("document/")) {
    return resolveMediaUrl(trimmed);
  }

  return trimmed;
}

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0]!.charAt(0);
  const second =
    parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : parts[0]!.charAt(1);
  return `${first}${second}`.toLocaleUpperCase();
}

function PersonOutline() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-[46%] w-[46%]"
      fill="none"
      aria-hidden
    >
      <circle cx="32" cy="24" r="10" stroke="currentColor" strokeWidth="2.75" />
      <path
        d="M14 52.5c2.2-9.2 9.2-13.5 18-13.5s15.8 4.3 18 13.5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvatarMark({ name, alt }: { name?: string; alt: string }) {
  const initials = initialsFromName(name ?? "");
  const label = alt.trim();

  return (
    <span
      className="@container absolute inset-0 flex items-center justify-center bg-[color:var(--mc-secondary)] text-white"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {initials ?
        <span className="font-display text-[38cqmin] leading-none font-bold tracking-tight">
          {initials}
        </span>
      : <PersonOutline />}
    </span>
  );
}

/**
 * Photo slot that falls back to initials (when `name` is set) or a person
 * outline on a teal pad. Never a stock portrait.
 */
export function CoachPhoto({
  src,
  alt,
  name,
  fill = true,
  className,
  sizes,
  priority,
}: CoachPhotoProps) {
  const resolved = ensurePhotoSrc(src);
  const [failed, setFailed] = useState(false);
  const [trackedSrc, setTrackedSrc] = useState(resolved);
  if (resolved !== trackedSrc) {
    setTrackedSrc(resolved);
    setFailed(false);
  }

  if (!resolved || failed) {
    return <AvatarMark name={name} alt={alt} />;
  }

  const isLocalHttp = resolved.startsWith("http://");

  return (
    <Image
      src={resolved}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={isLocalHttp}
      onError={() => setFailed(true)}
    />
  );
}
