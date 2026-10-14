"use client";

import { resolveMediaUrl } from "@/lib/media/media-url";

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/** Profile photo when the coach has one, otherwise their initials. */
export function CoachAvatar({
  name,
  photo,
  className = "coach-avatar",
}: {
  name: string;
  photo?: string | null;
  className?: string;
}) {
  const src = resolveMediaUrl(photo);
  return (
    <span className={className} aria-hidden>
      {src ?
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={40} height={40} decoding="async" />
      : <span>{coachInitials(name)}</span>}
    </span>
  );
}
