"use client";

import { useState } from "react";

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
  // Show the photo when there is one; initials only when there is none or it fails to load.
  const [bad, setBad] = useState(false);
  const [tracked, setTracked] = useState(src);
  if (src !== tracked) {
    setTracked(src);
    setBad(false);
  }
  const usable = (img: HTMLImageElement) =>
    img.naturalWidth > 0 && img.naturalHeight > 0;
  return (
    <span className={className} aria-hidden>
      {src && !bad ?
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={40}
          height={40}
          decoding="async"
          ref={(node) => {
            if (node?.complete && !usable(node)) setBad(true);
          }}
          onLoad={(event) => {
            if (!usable(event.currentTarget)) setBad(true);
          }}
          onError={() => setBad(true)}
        />
      : <span>{coachInitials(name)}</span>}
    </span>
  );
}
