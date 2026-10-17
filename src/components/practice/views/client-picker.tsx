"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ClientSummary } from "@/types/practice";

import { fetchClientList } from "@/lib/api/practice";
import { initials } from "@/lib/format";

type Props = {
  open: boolean;
  coachCode: string;
  onSelect: (client: ClientSummary) => void;
  onClose: () => void;
};

/** Popup list of the coach's clients, as on the Clients page, with search. */
export function ClientPicker({ open, coachCode, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [clients, setClients] = useState<ClientSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || clients) return;
    let cancelled = false;
    void fetchClientList({ coachCode })
      .then((rows) => {
        if (!cancelled) setClients(rows);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Could not load clients.",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [open, clients, coachCode]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (clients ?? []).filter(
      (client) =>
        client.clientCode &&
        (!q ||
          client.name.toLowerCase().includes(q) ||
          (client.mobileNo ?? "").includes(q)),
    );
  }, [clients, query]);

  return (
    <dialog
      ref={ref}
      className="mc-dialog"
      aria-labelledby="client-picker-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mc-dialog-body">
        <h2 id="client-picker-title" className="mc-dialog-title">
          Select client
        </h2>
        <input
          type="search"
          className="mc-field"
          placeholder="Search by name or mobile"
          aria-label="Search clients"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="max-h-72 overflow-y-auto rounded-xl border border-line">
          {error ?
            <p className="p-4 text-sm text-mc-destructive">{error}</p>
          : clients == null ?
            <p className="p-4 text-sm text-ink-muted">Loading clients…</p>
          : shown.length === 0 ?
            <p className="p-4 text-sm text-ink-muted">No clients found.</p>
          : <ul className="divide-y divide-line">
              {shown.map((client) => (
                <li key={client.clientCode}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center gap-3 px-3 text-left hover:bg-mc-secondary-light"
                    onClick={() => onSelect(client)}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mc-secondary font-display text-xs font-bold text-white">
                      {initials(client.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {client.name}
                      </span>
                      {client.mobileNo ?
                        <span className="block text-xs text-ink-muted">
                          {client.mobileNo}
                        </span>
                      : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          }
        </div>
        <div className="mc-dialog-actions">
          <button
            type="button"
            className="mc-dialog-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}
