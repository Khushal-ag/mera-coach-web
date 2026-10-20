"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;

/**
 * A home page stat such as "25K+" or "4.9/5". The server and the first client render both show the
 * final value, so hydration always matches. Once the stat scrolls into view it counts up from zero.
 */
export function StatNumber({
  target,
  decimals = 0,
  inline = "",
  unit,
}: {
  /** The number to count to, for example 25 for "25K+". */
  target: number;
  decimals?: number;
  /** Text glued to the number, for example "K". */
  inline?: string;
  /** Smaller trailing text, for example "+" or "/5". */
  unit: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frameId = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          setShown(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frameId = window.requestAnimationFrame(frame);
        };
        setShown(0);
        frameId = window.requestAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [target]);

  return (
    <span className="stat-num" ref={ref}>
      {shown.toFixed(decimals)}
      {inline}
      <span style={{ fontSize: 28 }}>{unit}</span>
    </span>
  );
}
