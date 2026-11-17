"use client";

import { useEffect, useMemo, useState } from "react";

import type { Segment } from "@/components/admin/coach-health";
import type { CoachStatsRow } from "@/lib/api/admin";

import { AdminStatusChip } from "@/components/admin/admin-status-chip";
import {
  assessCoach,
  formatDay,
  SEGMENT_TEST,
} from "@/components/admin/coach-health";
import {
  CltPager,
  CltSortTh,
  CltTableTools,
  usePagedRows,
  useSortedRows,
} from "@/components/practice/clt-list";
import { PracticePageHeader } from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { siteConfig } from "@/config/site";
import { fetchCoachStats } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const SEGMENTS: {
  key: Segment;
  label: string;
  hint: string;
  icon: string;
  accent: string;
}[] = [
  {
    key: "all",
    label: "All coaches",
    hint: "Everyone registered",
    icon: "fa-users",
    accent: "text-[var(--cl-text)]",
  },
  {
    key: "live",
    label: "Live",
    hint: "Visible, plan running",
    icon: "fa-signal",
    accent: "text-mc-secondary",
  },
  {
    key: "hidden",
    label: "Hidden",
    hint: "Profile switched off",
    icon: "fa-eye-slash",
    accent: "text-[var(--cl-gold)]",
  },
  {
    key: "expiring",
    label: "Expiring soon",
    hint: "Plan ends within 30 days",
    icon: "fa-hourglass-half",
    accent: "text-amber-600",
  },
  {
    key: "expired",
    label: "Expired",
    hint: "Plan has ended",
    icon: "fa-circle-exclamation",
    accent: "text-red-600",
  },
  {
    key: "inactive",
    label: "No activity",
    hint: "No clients or leads yet",
    icon: "fa-moon",
    accent: "text-[var(--cl-text-lt)]",
  },
];

function initials(name: string, code: string) {
  const parts = (name || code).trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  );
}

function Metric({ value }: { value: number }) {
  return (
    <td
      className={cn(
        "text-center tabular-nums",
        value > 0 ?
          "font-bold text-[var(--cl-text)]"
        : "text-[var(--cl-text-lt)] opacity-40",
      )}
    >
      {value}
    </td>
  );
}

export function CoachStatsPage() {
  const [rows, setRows] = useState<CoachStatsRow[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [perPage, setPerPage] = useState(25);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void fetchCoachStats()
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setLoadedAt(Date.now());
        setError("");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Could not load coach stats.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function refresh() {
    setLoading(true);
    setReloadKey((key) => key + 1);
  }

  const items = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.registeredOn.localeCompare(a.registeredOn))
        .map((row) => ({ row, health: assessCoach(row, loadedAt) })),
    [rows, loadedAt],
  );

  const counts = useMemo(() => {
    const result = {} as Record<Segment, number>;
    for (const { key } of SEGMENTS) {
      result[key] = items.filter((i) => SEGMENT_TEST[key](i.health)).length;
    }
    return result;
  }, [items]);

  const unverifiedCount = items.filter((i) => i.health.unverified).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ row, health }) => {
      if (!SEGMENT_TEST[segment](health)) return false;
      if (unverifiedOnly && !health.unverified) return false;
      if (!q) return true;
      return [row.coachCode, row.coachName, row.email, row.mobile]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, segment, unverifiedOnly, query]);

  const { sorted, sort, toggle } = useSortedRows(filtered, {
    coach: (i) => i.row.coachName,
    registered: (i) => i.row.registeredOn,
    plan: (i) => i.row.validUpto,
    clients: (i) => i.row.clients,
    checkups: (i) => i.row.checkups,
    leads: (i) => i.row.leads,
    packages: (i) => i.row.packageCount,
    events: (i) => i.row.coachEvent,
  });

  const paged = usePagedRows(sorted, perPage);
  const filtersOn = segment !== "all" || unverifiedOnly || query.trim() !== "";

  function pickSegment(next: Segment) {
    setSegment(segment === next ? "all" : next);
    paged.setPage(1);
  }

  function clearFilters() {
    setSegment("all");
    setUnverifiedOnly(false);
    setQuery("");
    paged.setPage(1);
  }

  const ready = !loading && rows.length > 0;

  return (
    <div>
      <PracticePageHeader
        title="Coach monitor"
        crumbs={[
          { label: "Admin", href: siteConfig.links.adminCoaches },
          { label: "Coaches" },
        ]}
        icon={<i className="fas fa-chart-bar text-lg" aria-hidden />}
      />

      {error ?
        <AlertBanner tone="error" className="mb-4">
          {error}
        </AlertBanner>
      : null}

      {ready ?
        <>
          <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {SEGMENTS.map(({ key, label, hint, icon, accent }) => (
              <button
                key={key}
                type="button"
                aria-pressed={segment === key}
                title={hint}
                onClick={() => pickSegment(key)}
                className={cn(
                  "rounded-[14px] border bg-white px-4 py-3 text-left shadow-[var(--cl-shadow)] transition hover:-translate-y-0.5",
                  segment === key ?
                    "border-[var(--cl-primary)] ring-2 ring-[var(--cl-primary)]/20"
                  : "border-[var(--cl-border)]",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wide text-[var(--cl-text-lt)] uppercase">
                    {label}
                  </span>
                  <i className={cn("fas text-sm", icon, accent)} aria-hidden />
                </span>
                <span
                  className={cn(
                    "mt-1 block font-[family-name:var(--font-poppins)] text-2xl font-extrabold",
                    accent,
                  )}
                >
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </>
      : null}

      <div className="clt-card">
        <div className="clt-card-header">
          <h2>
            <i className="fas fa-list" />{" "}
            {SEGMENTS.find((seg) => seg.key === segment)?.label}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="clt-btn clt-btn-secondary !h-8 !px-2.5 !text-[11px]"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh"
            >
              <i
                className={cn("fas fa-sync-alt", loading && "fa-spin")}
                aria-hidden
              />{" "}
              Refresh
            </button>
          </div>
        </div>
        <div className="clt-card-body">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={unverifiedOnly}
              onClick={() => {
                setUnverifiedOnly((v) => !v);
                paged.setPage(1);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                unverifiedOnly ?
                  "border-amber-500 bg-amber-50 text-amber-900"
                : "border-[var(--cl-border)] bg-white text-[var(--cl-text-lt)] hover:border-amber-400",
              )}
            >
              <i className="fas fa-envelope" aria-hidden /> Email not verified
              <span className="rounded-full bg-black/5 px-1.5 tabular-nums">
                {unverifiedCount}
              </span>
            </button>
            {filtersOn ?
              <button
                type="button"
                className="clt-btn clt-btn-secondary !h-8 !px-2.5 !text-[11px]"
                onClick={clearFilters}
              >
                <i className="fas fa-undo-alt" aria-hidden /> Clear filters
              </button>
            : null}
          </div>

          <CltTableTools
            selectId="adminCoachEntries"
            perPage={perPage}
            onPerPage={(value) => {
              setPerPage(value);
              paged.setPage(1);
            }}
            query={query}
            onQuery={(value) => {
              setQuery(value);
              paged.setPage(1);
            }}
          />
          <div className="clt-table-wrap">
            <table className="clt-table [&_td]:!px-2.5 [&_th]:!px-2.5">
              <thead>
                <tr>
                  <CltSortTh
                    label="Coach"
                    sortKey="coach"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Registered"
                    sortKey="registered"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Plan"
                    sortKey="plan"
                    sort={sort}
                    onSort={toggle}
                  />
                  <th>Profile</th>
                  <CltSortTh
                    label="Clients"
                    sortKey="clients"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Checkups"
                    sortKey="checkups"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Leads"
                    sortKey="leads"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Packages"
                    sortKey="packages"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Events"
                    sortKey="events"
                    sort={sort}
                    onSort={toggle}
                  />
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ?
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-10 text-center text-[var(--cl-text-lt)]"
                    >
                      <i className="fas fa-spinner fa-spin mr-2" aria-hidden />
                      Loading coaches…
                    </td>
                  </tr>
                : rows.length === 0 ?
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-10 text-center text-[var(--cl-text-lt)]"
                    >
                      No coaches have registered yet.
                    </td>
                  </tr>
                : paged.slice.length === 0 ?
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-10 text-center text-[var(--cl-text-lt)]"
                    >
                      No coaches match these filters.
                    </td>
                  </tr>
                : paged.slice.map(({ row, health }) => {
                    const days = health.daysLeft ?? 0;
                    return (
                      <tr
                        key={row.coachCode}
                        className={cn(
                          health.expired &&
                            "[&>td:first-child]:shadow-[inset_3px_0_0_#dc2626]",
                          health.expiringSoon &&
                            "[&>td:first-child]:shadow-[inset_3px_0_0_#d97706]",
                        )}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-mc-secondary-light text-xs font-bold text-mc-secondary uppercase">
                              {initials(row.coachName, row.coachCode)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[var(--cl-text)]">
                                  {row.coachName || "—"}
                                </span>
                                <span className="rounded bg-[var(--cl-bg)] px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-[var(--cl-text-lt)]">
                                  {row.coachCode}
                                </span>
                                {health.unverified ?
                                  <i
                                    className="fas fa-envelope text-xs text-amber-600"
                                    title="Email not verified"
                                    aria-label="Email not verified"
                                  />
                                : null}
                              </div>
                              <div className="max-w-[260px] truncate text-xs text-[var(--cl-text-lt)]">
                                {[row.email, row.mobile]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          {formatDay(row.registeredOn) || "—"}
                        </td>
                        <td className="whitespace-nowrap">
                          {health.expired ?
                            <AdminStatusChip
                              tone="bad"
                              icon="fa-circle-exclamation"
                            >
                              {days < 0 ?
                                `Expired ${-days}d ago`
                              : "Expired today"}
                            </AdminStatusChip>
                          : health.expiringSoon ?
                            <AdminStatusChip
                              tone="warn"
                              icon="fa-hourglass-half"
                            >
                              {days === 0 ? "Ends today" : `${days}d left`}
                            </AdminStatusChip>
                          : <AdminStatusChip tone="ok" icon="fa-check-circle">
                              Active
                            </AdminStatusChip>
                          }
                          <div className="mt-1 text-xs text-[var(--cl-text-lt)]">
                            until {formatDay(row.validUpto) || "—"}
                          </div>
                        </td>
                        <td>
                          <AdminStatusChip
                            tone={health.hidden ? "muted" : "ok"}
                            icon={health.hidden ? "fa-eye-slash" : "fa-eye"}
                          >
                            {health.hidden ? "Hidden" : "Visible"}
                          </AdminStatusChip>
                        </td>
                        <Metric value={row.clients} />
                        <Metric value={row.checkups} />
                        <Metric value={row.leads} />
                        <Metric value={row.packageCount} />
                        <Metric value={row.coachEvent} />
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <CltPager
            page={paged.page}
            pages={paged.pages}
            start={paged.start}
            end={paged.end}
            total={paged.total}
            onPage={paged.setPage}
          />
        </div>
      </div>
    </div>
  );
}
