"use client";

import { useEffect } from "react";

/** Counts a stat such as "25K+" or "4.9/5" up from zero. */
function countUp(el: HTMLElement) {
  const original = el.textContent ?? "";
  const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(original.trim());
  if (!match) return;
  const target = Number.parseFloat(match[1]!);
  const decimals = match[1]!.includes(".") ? 1 : 0;
  const suffix = match[2] ?? "";
  const start = performance.now();
  const duration = 1400;
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
    if (t < 1) window.requestAnimationFrame(frame);
    else el.textContent = original;
  };
  el.textContent = `0${suffix}`;
  window.requestAnimationFrame(frame);
}

/**
 * Stat counters on the home page. Section reveals are pure CSS (scroll-driven
 * animations in public.css), so this never changes element classes or
 * attributes and cannot disturb React hydration. Only the stat text inside the
 * server-rendered strip changes, and only once it scrolls into view.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const strip = document.querySelector<HTMLElement>(".trust-strip");
    if (!strip || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        strip.querySelectorAll<HTMLElement>(".stat-num").forEach(countUp);
      },
      { threshold: 0.4 },
    );
    io.observe(strip);
    return () => io.disconnect();
  }, []);

  return null;
}
