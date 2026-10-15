"use client";

import { useState } from "react";

import { initials } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media/media-url";

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
      : <span>{initials(name, { fallback: "C" })}</span>}
    </span>
  );
}
