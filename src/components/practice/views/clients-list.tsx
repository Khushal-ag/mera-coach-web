"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import type { ClientSummary } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeRosterSkeleton,
  PracticeSearch,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { photography } from "@/config/photography";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import { fetchClientList } from "@/lib/api/practice";
import { cn } from "@/lib/utils";

function statusTone(status?: string) {
  if (!status) return "bg-paper-elevated text-ink-muted";
  const s = status.toLowerCase();
  if (s === "active")
    return "bg-[color:var(--mc-secondary-light)] text-mc-secondary";
  if (s === "new")
    return "bg-[color:var(--mc-primary-light)] text-[color:var(--mc-primary)]";
  return "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]";
}

export function ClientsListView() {
  const { session } = useAuth();
  const { openAddClient, checking, error: gateError } = useOpenAddClient();
  const [rows, setRows] = useState<ClientSummary[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const timer = window.setTimeout(
      () => {
        setLoading(true);
        setError(null);
        void fetchClientList({
          coachCode: session.coachCode,
          searchText: search.trim() || undefined,
        })
          .then((list) => {
            if (!cancelled) setRows(list);
          })
          .catch((err) => {
            if (!cancelled) {
              setError(
                err instanceof Error ? err.message : "Could not load clients.",
              );
              setRows([]);
            }
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      search ? 250 : 0,
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode, search]);

  const addButton = useMemo(
    () => (
      <button
        type="button"
        className="mc-btn-primary w-full sm:w-auto"
        disabled={checking}
        onClick={() => void openAddClient()}
      >
        <Plus className="size-4" strokeWidth={2.25} aria-hidden />
        {checking ? "Checking…" : "Add client"}
      </button>
    ),
    [checking, openAddClient],
  );

  const countLabel =
    rows == null ? null : (
      `${rows.length} client${rows.length === 1 ? "" : "s"}`
    );

  return (
    <div className="mx-auto max-w-6xl">
      <PracticePageHeader
        title="Clients"
        description="Search your roster, open a profile, or start a new assessment."
        action={addButton}
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {gateError ?
        <AlertBanner tone="error">{gateError}</AlertBanner>
      : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PracticeSearch
          id="client-search"
          label="Search clients"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or mobile"
          autoComplete="off"
        />
        {countLabel ?
          <p className="text-sm text-ink-muted tabular-nums">{countLabel}</p>
        : null}
      </div>

      {loading && rows == null ?
        <PracticeRosterSkeleton />
      : !rows?.length ?
        <PracticeEmpty
          image={search.trim() ? undefined : photography.emptyClients}
          imageAlt="A folded towel and a closed notebook on a gym bench"
          title={search.trim() ? "No matches" : "No clients yet"}
          body={
            search.trim() ?
              "Try a different name or mobile number."
            : "Use Add client above to start an assessment."
          }
        />
      : <>
          {/* Desktop / tablet table */}
          <div className="mc-roster hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="mc-roster-head sticky top-0">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 font-semibold lg:table-cell"
                  >
                    Age
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="hidden px-4 py-3 font-semibold xl:table-cell"
                  >
                    Last checkup
                  </th>
                  <th scope="col" className="sr-only px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((client) => {
                  const code = client.clientCode;
                  if (!code) return null;
                  return (
                    <tr
                      key={code}
                      className="transition hover:bg-[color:var(--mc-explore-canvas)]"
                    >
                      <td className="px-4 py-2">
                        <Link
                          href={`/dashboard/clients/${encodeURIComponent(code)}`}
                          className="inline-flex min-h-11 items-center font-display font-bold text-ink hover:text-mc-secondary"
                        >
                          {client.name || "Unnamed client"}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-ink-muted">
                        {client.mobileNo || "-"}
                      </td>
                      <td className="hidden px-4 py-2 text-ink-muted tabular-nums lg:table-cell">
                        {client.age != null ? `${client.age}` : "-"}
                      </td>
                      <td className="px-4 py-2">
                        {client.status ?
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                              statusTone(client.status),
                            )}
                          >
                            {client.status}
                          </span>
                        : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="hidden px-4 py-2 text-ink-muted xl:table-cell">
                        {client.lastCheckupDate || "-"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/dashboard/clients/${encodeURIComponent(code)}`}
                          className="inline-flex min-h-11 items-center font-semibold text-mc-secondary hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: compact list, still web-native (not portrait cards) */}
          <ul className="mc-roster divide-y divide-line md:hidden">
            {rows.map((client) => {
              const code = client.clientCode;
              if (!code) return null;
              return (
                <li key={code}>
                  <Link
                    href={`/dashboard/clients/${encodeURIComponent(code)}`}
                    className="flex min-h-11 items-start justify-between gap-3 px-4 py-3.5 transition hover:bg-paper"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display font-bold text-ink">
                        {client.name || "Unnamed client"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-ink-muted">
                        {[
                          client.mobileNo,
                          client.age != null ? `${client.age} yrs` : null,
                          client.lastCheckupDate,
                        ]
                          .filter(Boolean)
                          .join(", ") || "No contact details"}
                      </p>
                    </div>
                    {client.status ?
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
                          statusTone(client.status),
                        )}
                      >
                        {client.status}
                      </span>
                    : <span className="shrink-0 text-sm font-semibold text-mc-secondary">
                        Open
                      </span>
                    }
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      }
    </div>
  );
}
