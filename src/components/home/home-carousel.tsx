"use client";

import { useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

export function HomeCarousel({
  children,
  total,
  interval,
  label,
  trackClass,
}: {
  children: ReactNode;
  total: number;
  interval: number;
  label: string;
  trackClass: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(3);
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const maxPos = Math.max(0, total - perView);
  const safeIndex = Math.min(index, maxPos);

  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      const nextPer =
        width <= 600 ? 1
        : width <= 900 ? 2
        : 3;
      setPerView(nextPer);
      const viewport = viewportRef.current?.offsetWidth ?? 0;
      setStep(viewport ? Math.round((viewport + 24) / nextPer) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (paused || maxPos <= 0) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const visible = Math.min(current, maxPos);
        return visible < maxPos ? visible + 1 : 0;
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [interval, maxPos, paused]);

  return (
    <>
      <div
        className="coaches-carousel-wrap"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          type="button"
          className={safeIndex <= 0 ? "car-arrow car-disabled" : "car-arrow"}
          aria-label={`Previous ${label}`}
          onClick={() => setIndex(Math.max(0, safeIndex - 1))}
        >
          <i className="fas fa-chevron-left" />
        </button>
        <div className="coaches-carousel-viewport" ref={viewportRef}>
          <div
            className={trackClass}
            style={{ transform: `translateX(-${safeIndex * step}px)` }}
          >
            {children}
          </div>
        </div>
        <button
          type="button"
          className={
            safeIndex >= maxPos ? "car-arrow car-disabled" : "car-arrow"
          }
          aria-label={`Next ${label}`}
          onClick={() => setIndex(Math.min(maxPos, safeIndex + 1))}
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
      <div className="car-dots">
        {Array.from({ length: maxPos + 1 }, (_, dot) => (
          <button
            key={dot}
            type="button"
            className={dot === safeIndex ? "car-dot car-dot-active" : "car-dot"}
            aria-label={`Go to slide ${dot + 1}`}
            onClick={() => setIndex(dot)}
          />
        ))}
      </div>
    </>
  );
}
