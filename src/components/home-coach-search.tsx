"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

type Category = { code: string; label: string };

/**
 * Finder bar for the home hero. The category list stays in the category
 * column (it grows downward) so it never paints over the search field.
 */
export function HomeCoachSearch({ categories }: { categories: Category[] }) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const selected =
    categories.find((item) => item.code === code)?.label ?? "All categories";

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const options = [{ code: "", label: "All categories" }, ...categories];

  useEffect(() => {
    if (!open) return;
    const match = categories.findIndex((item) => item.code === code);
    const selectedIndex = code === "" || match < 0 ? 0 : match + 1;
    optionRefs.current[selectedIndex]?.focus();
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, code, categories]);

  function focusOption(index: number) {
    const count = optionRefs.current.length;
    if (count === 0) return;
    const next = (index + count) % count;
    optionRefs.current[next]?.focus();
  }

  function choose(next: string) {
    setCode(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <form
      id="find"
      action="/coach"
      className="grid items-start gap-2 rounded-[20px] border border-line bg-white p-2 shadow-[0_22px_50px_rgba(23,134,118,0.16)] sm:p-2.5 lg:grid-cols-[minmax(13.5rem,17rem)_minmax(0,1fr)_auto]"
    >
      {code ?
        <input type="hidden" name="category" value={code} />
      : null}
      <div ref={rootRef} className="relative min-w-0">
        <label id={`${listId}-label`} className="sr-only">
          Category
        </label>
        <button
          ref={buttonRef}
          type="button"
          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-line bg-[color:var(--paper)] px-3.5 text-left font-display text-sm font-semibold text-ink transition hover:border-mc-secondary/40 focus-visible:border-mc-secondary focus-visible:ring-2 focus-visible:ring-mc-secondary/30 focus-visible:outline-none"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${listId}-label`}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <span className="truncate">{selected}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-mc-secondary transition-transform motion-safe:duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {open ?
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={`${listId}-label`}
            className="mt-1.5 max-h-60 overflow-auto rounded-xl border border-line bg-white py-1 shadow-[0_16px_40px_rgba(23,134,118,0.12)]"
          >
            {options.map((item, index) => {
              const active = item.code === code;
              return (
                <li key={item.code || "all"}>
                  <button
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-sm",
                      active ?
                        "bg-mc-secondary font-semibold text-white"
                      : "text-ink hover:bg-mc-secondary-light",
                    )}
                    onClick={() => choose(item.code)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        focusOption(index + 1);
                      } else if (event.key === "ArrowUp") {
                        event.preventDefault();
                        focusOption(index - 1);
                      } else if (event.key === "Home") {
                        event.preventDefault();
                        focusOption(0);
                      } else if (event.key === "End") {
                        event.preventDefault();
                        focusOption(options.length - 1);
                      }
                    }}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                    {active ?
                      <Check className="size-4 shrink-0" aria-hidden />
                    : null}
                  </button>
                </li>
              );
            })}
          </ul>
        : null}
      </div>
      <label className="sr-only" htmlFor="hero-search">
        Search coaches
      </label>
      <input
        id="hero-search"
        name="search"
        type="search"
        placeholder="Search by name, specialty, or city"
        className="min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-mc-secondary focus:ring-2 focus:ring-mc-secondary/30"
      />
      <button
        type="submit"
        className="mc-btn-primary mc-btn-hero min-h-12 w-full rounded-xl px-5 lg:w-auto"
      >
        <Search className="size-4" aria-hidden />
        Search
      </button>
    </form>
  );
}
