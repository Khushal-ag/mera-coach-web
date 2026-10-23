"use client";

import { useState } from "react";

/** Characters past which the description is cut off (about four lines). */
const PREVIEW_CHARS = 220;

/**
 * The coach's description in the profile hero. A long description would stretch the hero and push
 * the photo and the call to action far down the page, so it shows four lines until the visitor asks
 * for the rest.
 */
export function ExpandableBio({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const flat = text.replace(/\s+/g, " ").trim();
  const long = flat.length > PREVIEW_CHARS;
  return (
    <div className="mb-6 max-w-[520px]">
      <p
        className="cp-hero-bio !mb-0"
        style={
          open || !long ?
            { whiteSpace: "pre-line" }
          : {
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
        }
      >
        {open || !long ? text.trim() : flat}
      </p>
      {long ?
        <button
          type="button"
          className="mt-2 text-sm font-semibold text-white underline"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? "Show less" : "Read more"}
        </button>
      : null}
    </div>
  );
}
