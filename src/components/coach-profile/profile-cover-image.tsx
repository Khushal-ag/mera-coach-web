"use client";

import { useState } from "react";

function decodedOk(img: HTMLImageElement): boolean {
  return img.naturalWidth > 2 && img.naturalHeight > 2;
}

/**
 * Wide cover photo. A failed, empty, or tiny decode leaves the parent
 * teal gradient visible: no placeholder image.
 */
export function ProfileCoverImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setFailed(false);
  }
  if (!src || failed) return null;

  return (
    // next/image can miss a pre-hydration failure and leave a broken icon.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      decoding="async"
      draggable={false}
      className="absolute inset-0 size-full object-cover"
      ref={(node) => {
        if (!node?.complete) return;
        if (!decodedOk(node)) setFailed(true);
      }}
      onLoad={(event) => {
        if (!decodedOk(event.currentTarget)) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
