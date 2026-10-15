"use client";

import { useState } from "react";

import { resolveMediaUrl } from "@/lib/media/media-url";
import { cn } from "@/lib/utils";

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

/**
 * Stock filenames that are not a real portrait. A 404 of one of these, or of
 * a missing `/document/…` file, uses the same initials mark as an empty src.
 */
function isRetiredFaceFallback(src: string): boolean {
  const path = (src.split(/[?#]/, 1)[0] ?? src).toLowerCase();
  const file = path.slice(path.lastIndexOf("/") + 1);
  if (!file) return false;
  return (
    file.includes("coach-avatar-fallback") ||
    file.includes("avatar-fallback") ||
    file.includes("avatar-default") ||
    file.includes("default-avatar") ||
    file === "no-image.png" ||
    file === "noimage.png" ||
    file === "no-photo.png" ||
    file === "placeholder.png" ||
    file === "placeholder.jpg" ||
    file === "placeholder-user.png"
  );
}

/**
 * Safety: if a caller still passes a relative `/document/…` path, join it to
 * the API origin here so the browser never requests it against the Next host
 * by accident. A joined URL that still 404s falls back in `onError`.
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

function decodedOk(img: HTMLImageElement): boolean {
  return img.naturalWidth > 0 && img.naturalHeight > 0;
}

/**
 * Photo slot that falls back to initials (when `name` is set) or a person
 * outline on a teal pad. The image stays hidden until it decodes, so a
 * 404 never paints the browser's broken-image icon.
 *
 * `next/image`'s `onError` does not run when the file already failed before
 * hydration, which left the broken icon on screen. A native image reports
 * that failure from `complete` / `naturalWidth` as well as `onError`.
 */
export function CoachPhoto({
  src,
  alt,
  name,
  fill = true,
  className,
  priority = false,
}: CoachPhotoProps) {
  const resolved = ensurePhotoSrc(src);
  const [status, setStatus] = useState<"pending" | "ok" | "bad">(
    resolved ? "pending" : "bad",
  );
  const [trackedSrc, setTrackedSrc] = useState(resolved);
  if (resolved !== trackedSrc) {
    setTrackedSrc(resolved);
    setStatus(resolved ? "pending" : "bad");
  }

  if (!resolved || status === "bad") {
    return <AvatarMark name={name} alt={alt} />;
  }

  const shown = status === "ok";

  return (
    <>
      {shown ? null : <AvatarMark name={name} alt={alt} />}
      {/* next/image swallows the pre-hydration error, so the broken icon stuck. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={shown ? alt : ""}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        ref={(node) => {
          if (!node?.complete) return;
          setStatus(decodedOk(node) ? "ok" : "bad");
        }}
        onLoad={(event) => {
          setStatus(decodedOk(event.currentTarget) ? "ok" : "bad");
        }}
        onError={() => setStatus("bad")}
        className={cn(
          fill ? "absolute inset-0 size-full" : "size-full",
          "object-cover",
          shown ? className : "invisible",
        )}
      />
    </>
  );
}
