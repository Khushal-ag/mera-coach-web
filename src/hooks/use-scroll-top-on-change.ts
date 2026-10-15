"use client";

import { useEffect, useRef } from "react";

/**
 * Multi-step forms keep the page scroll when the step changes, so pressing
 * Next at the bottom of a long step lands the next one scrolled down. Return
 * to the top whenever the value changes (not on first render).
 */
export function useScrollTopOnChange(value: unknown) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [value]);
}
