"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type MediaPreviewProps = {
  src: string;
  alt?: string;
  sizes: string;
  className?: string;
};

function decodedOk(img: HTMLImageElement): boolean {
  return img.naturalWidth > 2 && img.naturalHeight > 2;
}

/**
 * Remote and local photo previews.
 * The image stays hidden until it decodes so a 404 does not show a broken icon.
 * Parent must be `relative` with a size.
 */
export function MediaPreview({
  src,
  alt = "",
  className = "object-cover",
}: MediaPreviewProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setFailed(false);
    setReady(false);
  }

  if (!src || failed) return null;

  return (
    // Native img: blob/data previews, and a failed /document file must not use next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={ready ? alt : ""}
      decoding="async"
      draggable={false}
      ref={(node) => {
        if (!node?.complete) return;
        if (decodedOk(node)) setReady(true);
        else setFailed(true);
      }}
      onLoad={(event) => {
        if (decodedOk(event.currentTarget)) setReady(true);
        else setFailed(true);
      }}
      onError={() => setFailed(true)}
      className={cn(
        "absolute inset-0 size-full",
        ready ? className : "invisible",
      )}
    />
  );
}
