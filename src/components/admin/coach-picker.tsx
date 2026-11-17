"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type CoachOption = {
  coachCode: string;
  coachName: string;
};

type SharedProps = {
  id?: string;
  label?: string;
  hint?: string;
  options: CoachOption[];
  disabled?: boolean;
  loading?: boolean;
  error?: string;
};

type MultiProps = SharedProps & {
  mode?: "multi";
  /** Empty = Global (null CoachCode). Non-empty = specific coaches. */
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
  /** When true, Select all means Global (empty selection), not every coach. */
  selectAllMeansGlobal?: boolean;
};

type SingleProps = SharedProps & {
  mode: "single";
  /** Empty string = Global / any. */
  value: string;
  onChange: (code: string) => void;
  allowGlobal?: boolean;
  globalLabel?: string;
};

export type CoachPickerProps = MultiProps | SingleProps;

function optionLabel(opt: CoachOption) {
  const name = opt.coachName.trim();
  return name ? `${name} (${opt.coachCode})` : opt.coachCode;
}

function matchesQuery(opt: CoachOption, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    opt.coachCode.toLowerCase().includes(q) ||
    opt.coachName.toLowerCase().includes(q)
  );
}

function isMultiProps(props: CoachPickerProps): props is MultiProps {
  return props.mode !== "single";
}

/**
 * Searchable coach picker for admin.
 * Multi: empty selection = Global; "Select all" clears picks (Global).
 * Single: optional Global sentinel + one coach.
 */
export function CoachPicker(props: CoachPickerProps) {
  const autoId = useId();
  const listId = `${autoId}-list`;
  const inputId = props.id ?? `${autoId}-search`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => props.options.filter((opt) => matchesQuery(opt, query)),
    [props.options, query],
  );

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const multi = isMultiProps(props);
  const multiSelectedCodes = multi ? props.selectedCodes : null;
  const selectedCodes = useMemo(
    () => multiSelectedCodes ?? [],
    [multiSelectedCodes],
  );
  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);
  const selectAllMeansGlobal =
    multi ? (props.selectAllMeansGlobal ?? true) : false;

  const summary = (() => {
    if (!multi) {
      if (!props.value) {
        return props.allowGlobal === false ?
            "Choose a coach"
          : (props.globalLabel ?? "All coaches");
      }
      const hit = props.options.find((o) => o.coachCode === props.value);
      return hit ? optionLabel(hit) : props.value;
    }
    if (selectedCodes.length === 0) {
      return "Global — all coach profiles";
    }
    if (selectedCodes.length === 1) {
      const hit = props.options.find((o) => o.coachCode === selectedCodes[0]);
      return hit ? optionLabel(hit) : selectedCodes[0];
    }
    return `${selectedCodes.length} coaches selected`;
  })();

  function toggleMulti(code: string) {
    if (!multi) return;
    if (selectedSet.has(code)) {
      props.onChange(selectedCodes.filter((c) => c !== code));
    } else {
      props.onChange([...selectedCodes, code]);
    }
  }

  function selectAllMulti() {
    if (!multi) return;
    if (selectAllMeansGlobal) {
      props.onChange([]);
      return;
    }
    props.onChange(props.options.map((o) => o.coachCode));
  }

  return (
    <div className="clt-form-group" ref={rootRef}>
      {props.label ?
        <label htmlFor={inputId}>{props.label}</label>
      : null}
      {props.hint ?
        <p className="mb-2 text-xs leading-relaxed text-[var(--cl-text-lt)]">
          {props.hint}
        </p>
      : null}

      <button
        type="button"
        id={inputId}
        className="clt-form-control flex w-full items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={props.disabled || props.loading}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 truncate">
          {props.loading ? "Loading coaches…" : summary}
        </span>
        <i
          className={`fas fa-chevron-${open ? "up" : "down"} shrink-0 text-[var(--cl-text-lt)]`}
          aria-hidden
        />
      </button>

      {open ?
        <div
          id={listId}
          role="listbox"
          aria-multiselectable={multi || undefined}
          className="mt-2 overflow-hidden rounded-[12px] border border-[var(--cl-border)] bg-white shadow-[var(--cl-shadow)]"
        >
          <div className="border-b border-[var(--cl-border)] p-2">
            <input
              type="search"
              className="clt-form-control"
              placeholder="Search name or code…"
              value={query}
              autoFocus
              aria-label="Search coaches"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
            />
          </div>

          {multi ?
            <div className="flex flex-wrap gap-2 border-b border-[var(--cl-border)] px-3 py-2">
              <button
                type="button"
                className="clt-btn clt-btn-secondary !h-8 !px-2.5 !text-[11px]"
                onClick={selectAllMulti}
              >
                <i className="fas fa-globe" aria-hidden />{" "}
                {selectAllMeansGlobal ? "Select all (Global)" : "Select all"}
              </button>
              <button
                type="button"
                className="clt-btn clt-btn-secondary !h-8 !px-2.5 !text-[11px]"
                onClick={() => props.onChange([])}
                disabled={selectedCodes.length === 0}
              >
                Clear
              </button>
            </div>
          : props.allowGlobal !== false ?
            <button
              type="button"
              role="option"
              aria-selected={!props.value}
              className={`flex w-full items-center gap-2 border-b border-[var(--cl-border)] px-3 py-2.5 text-left text-sm hover:bg-[var(--cl-bg)] ${
                !props.value ? "bg-[var(--cl-bg)] font-semibold" : ""
              }`}
              onClick={() => {
                props.onChange("");
                setOpen(false);
                setQuery("");
              }}
            >
              <i className="fas fa-globe text-[var(--cl-gold)]" aria-hidden />
              {props.globalLabel ?? "All coaches / Global"}
            </button>
          : null}

          <ul className="max-h-56 overflow-y-auto py-1">
            {props.error ?
              <li className="px-3 py-4 text-sm text-red-700">{props.error}</li>
            : filtered.length === 0 ?
              <li className="px-3 py-4 text-center text-sm text-[var(--cl-text-lt)]">
                {props.options.length === 0 ?
                  "No coaches available."
                : "No coaches match your search."}
              </li>
            : filtered.map((opt) => {
                const selected =
                  multi ?
                    selectedSet.has(opt.coachCode)
                  : props.value === opt.coachCode;
                return (
                  <li key={opt.coachCode}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-[var(--cl-bg)] ${
                        selected ? "bg-[var(--cl-bg)]" : ""
                      }`}
                      onClick={() => {
                        if (multi) {
                          toggleMulti(opt.coachCode);
                        } else {
                          props.onChange(opt.coachCode);
                          setOpen(false);
                          setQuery("");
                        }
                      }}
                    >
                      {multi ?
                        <span
                          className={`grid size-4 shrink-0 place-items-center rounded border ${
                            selected ?
                              "border-mc-secondary bg-mc-secondary text-white"
                            : "border-[var(--cl-border)] bg-white"
                          }`}
                          aria-hidden
                        >
                          {selected ?
                            <i className="fas fa-check text-[9px]" />
                          : null}
                        </span>
                      : <span
                          className={`size-2 shrink-0 rounded-full ${
                            selected ? "bg-mc-secondary" : (
                              "bg-[var(--cl-border)]"
                            )
                          }`}
                          aria-hidden
                        />
                      }
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[var(--cl-text)]">
                          {opt.coachName.trim() || opt.coachCode}
                        </span>
                        {opt.coachName.trim() ?
                          <span className="block truncate font-mono text-[11px] text-[var(--cl-text-lt)]">
                            {opt.coachCode}
                          </span>
                        : null}
                      </span>
                    </button>
                  </li>
                );
              })
            }
          </ul>
        </div>
      : null}

      {multi && selectedCodes.length > 0 ?
        <p className="mt-1.5 text-xs text-[var(--cl-text-lt)]">
          Creates one creative per selected coach. Use Select all for a single
          global creative.
        </p>
      : null}
    </div>
  );
}
