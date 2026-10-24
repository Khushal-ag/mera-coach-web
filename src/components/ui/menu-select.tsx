"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type MenuOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MenuChange = {
  target: { value: string; name: string };
};

type MenuSelectProps = {
  id?: string;
  name?: string;
  options: MenuOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: MenuChange) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  tone?: "light" | "dark";
  invalid?: boolean;
  /**
   * `bar` is the borderless control inside a joined search row.
   * `field` matches the other themed inputs.
   */
  variant?: "field" | "bar";
  /** Public pages use the Poppins green/brown menu in public.css. */
  skin?: "app" | "public";
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Themed replacement for a native select. The open list is a cream panel
 * with forest text, positioned under this control. From the sm breakpoint
 * it is absolutely positioned so a horizontal search row stays uncovered;
 * below that it stays in normal flow so it does not paint over the field
 * underneath.
 */
export function MenuSelect({
  id,
  name,
  options,
  value,
  defaultValue = "",
  onChange,
  required,
  disabled,
  placeholder = "Select",
  tone = "light",
  invalid,
  variant = "field",
  skin = "app",
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: MenuSelectProps) {
  const autoId = useId();
  const buttonId = id ?? autoId;
  const listId = `${autoId}-list`;
  const valueId = `${autoId}-value`;
  const labelledBy =
    ariaLabelledBy ? `${ariaLabelledBy} ${valueId}` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [missing, setMissing] = useState(false);
  const current = value !== undefined ? value : uncontrolled;
  const selected = options.find((item) => item.value === current);
  const selectedLabel = selected?.label ?? (current || placeholder);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    if (!wasOpen.current) {
      const selectedIndex = options.findIndex((item) => item.value === current);
      const index = selectedIndex >= 0 ? selectedIndex : 0;
      optionRefs.current[index]?.focus();
      wasOpen.current = true;
    }

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, options, current]);

  function focusFrom(start: number, direction: 1 | -1) {
    const count = options.length;
    if (count === 0) return;
    for (let step = 0; step < count; step += 1) {
      const index = (start + direction * step + count * 2) % count;
      const option = options[index];
      if (option && !option.disabled) {
        optionRefs.current[index]?.focus();
        return;
      }
    }
  }

  function choose(next: string) {
    setOpen(false);
    buttonRef.current?.focus();
    if (next) setMissing(false);
    if (next === current) return;
    if (value === undefined) setUncontrolled(next);
    onChange?.({ target: { value: next, name: name ?? "" } });
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative min-w-0", open && "z-30", className)}
    >
      {name || required ?
        <input
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          name={name}
          value={current}
          required={required || undefined}
          disabled={disabled}
          onChange={() => {
            /* The menu owns this value. */
          }}
          onInvalid={(event) => {
            event.preventDefault();
            setMissing(true);
            setOpen(true);
            buttonRef.current?.focus();
          }}
          className="sr-only"
        />
      : null}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-none disabled:cursor-default",
          skin === "public" ? "ui-select-btn"
          : variant === "bar" ?
            "min-h-14 border-b border-line bg-transparent px-4 font-display text-base font-medium text-mc-secondary focus-visible:bg-mc-primary-light sm:h-full sm:border-r sm:border-b-0"
          : cn(
              "mc-field text-base",
              tone === "dark" && "mc-field-dark",
              (invalid || missing) && "mc-field-error",
              tone === "dark" ? "text-white" : "text-mc-secondary",
            ),
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-required={required || undefined}
        aria-invalid={invalid || missing || undefined}
        title={selectedLabel}
        data-empty={current === "" ? "" : undefined}
        onClick={() => {
          if (!disabled) setOpen((next) => !next);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span id={valueId} className="min-w-0 truncate">
          {selectedLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200",
            skin === "public" ? "ui-select-chevron" : (
              cn("text-mc-primary", tone === "dark" && "text-mc-accent")
            ),
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ?
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={ariaLabelledBy ?? valueId}
          className={cn(
            skin === "public" ? "ui-select-menu" : (
              "z-30 mt-1 max-h-60 w-full min-w-0 overflow-auto overscroll-contain rounded-xl border border-line bg-paper py-1 text-mc-secondary shadow-[0_16px_40px_rgba(44,24,16,0.14)] sm:absolute sm:inset-x-0 sm:top-full sm:w-auto"
            ),
          )}
        >
          {options.map((item, index) => {
            const active = item.value === current;
            return (
              <li key={`${item.value}-${index}`}>
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={item.disabled}
                  className={cn(
                    skin === "public" ?
                      cn("ui-select-option", active && "is-active")
                    : cn(
                        "flex min-h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-left text-base focus-visible:outline-none disabled:cursor-default",
                        active ?
                          "bg-mc-secondary font-semibold text-white"
                        : "text-mc-secondary hover:bg-mc-primary-light focus-visible:bg-mc-primary-light",
                      ),
                    item.disabled && "opacity-50",
                  )}
                  onClick={() => {
                    if (!item.disabled) choose(item.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      focusFrom(index + 1, 1);
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      focusFrom(index - 1, -1);
                    } else if (event.key === "Home") {
                      event.preventDefault();
                      focusFrom(0, 1);
                    } else if (event.key === "End") {
                      event.preventDefault();
                      focusFrom(options.length - 1, -1);
                    } else if (event.key === "Tab") {
                      event.preventDefault();
                      setOpen(false);
                      buttonRef.current?.focus();
                    }
                  }}
                >
                  <span className="min-w-0 break-words whitespace-normal">
                    {item.label}
                  </span>
                  {active ?
                    <Check className="size-4 shrink-0" aria-hidden />
                  : null}
                </button>
              </li>
            );
          })}
        </ul>
      : null}
      {missing ?
        <p className="mc-field-error-text" role="alert">
          Choose an option.
        </p>
      : null}
    </div>
  );
}
