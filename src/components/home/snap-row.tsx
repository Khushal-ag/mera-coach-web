"use client";

import { useRef } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function SnapRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  function move(direction: number) {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.max(280, node.clientWidth * 0.8),
      behavior: "smooth",
    });
  }

  return (
    <div className="mt-10 flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        className="hidden size-11 shrink-0 items-center justify-center rounded-xl border-2 border-mc-secondary bg-white text-mc-secondary shadow-[0_4px_0_#1b4332] sm:inline-flex"
        aria-label={`Previous ${label}`}
        onClick={() => move(-1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
      <div
        ref={scroller}
        className="flex min-w-0 flex-1 snap-x snap-mandatory [scrollbar-width:thin] gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </div>
      <button
        type="button"
        className="hidden size-11 shrink-0 items-center justify-center rounded-xl border-2 border-mc-secondary bg-white text-mc-secondary shadow-[0_4px_0_#1b4332] sm:inline-flex"
        aria-label={`Next ${label}`}
        onClick={() => move(1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
