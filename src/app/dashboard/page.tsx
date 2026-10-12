"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowRight, Plus, Users } from "lucide-react";

import type {
  ClientSummary,
  EnquiryLead,
  RecheckupDueClient,
} from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import {
  fetchClientList,
  fetchEnquiryLeads,
  fetchRecheckupList,
} from "@/lib/api/practice";

function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MetricCell({
  label,
  value,
  href,
  loading,
}: {
  label: string;
  value: string;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col gap-1 rounded-[10px] px-1 py-1 transition hover:bg-[color:var(--mc-secondary-light)]/40 focus-visible:ring-2 focus-visible:ring-[color:var(--mc-secondary)]/35 focus-visible:outline-none"
    >
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <span className="font-display text-2xl font-bold tracking-tight text-ink tabular-nums group-hover:text-[color:var(--mc-secondary-dark)] sm:text-3xl">
        {loading ? "…" : value}
      </span>
    </Link>
  );
}

export default function DashboardHomePage() {
  const { session } = useAuth();
  const { openAddClient, checking, error: gateError } = useOpenAddClient();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
  const [due, setDue] = useState<RecheckupDueClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void Promise.allSettled([
        fetchClientList({ coachCode }),
        fetchEnquiryLeads(coachCode),
        fetchRecheckupList({ coachCode }),
      ]).then((results) => {
        if (cancelled) return;
        const [c, l, d] = results;
        if (c.status === "fulfilled") setClients(c.value);
        if (l.status === "fulfilled") setLeads(l.value);
        if (d.status === "fulfilled") setDue(d.value);
        const failures = results.filter((r) => r.status === "rejected");
        if (failures.length === results.length) {
          setError("Could not load dashboard metrics. Try refreshing.");
        }
        setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode]);

  const openLeads = useMemo(() => leads.filter((x) => !x.isContacted), [leads]);

  const firstName = session?.fullName?.split(" ")[0] || "Coach";
  const recentClients = clients.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">
            {greetingFor()}, {firstName}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Practice overview
          </h1>
          <p className="mt-1 max-w-[48ch] text-sm text-ink-muted">
            What needs attention across your roster today.
          </p>
        </div>
        <button
          type="button"
          disabled={checking}
          onClick={() => void openAddClient()}
          className="mc-btn-primary shrink-0"
        >
          <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          {checking ? "Checking…" : "Add client"}
        </button>
      </header>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {gateError ?
        <AlertBanner tone="error">{gateError}</AlertBanner>
      : null}

      {/* Compact KPI row - text-forward, not app metric chips */}
      <section
        aria-label="Key metrics"
        className="grid grid-cols-3 gap-4 border-b border-line pb-6 sm:gap-8"
      >
        <MetricCell
          label="Clients"
          value={String(clients.length)}
          href="/dashboard/clients"
          loading={loading && clients.length === 0}
        />
        <MetricCell
          label="Open leads"
          value={String(openLeads.length)}
          href="/dashboard/leads"
          loading={loading && leads.length === 0}
        />
        <MetricCell
          label="Checkups due"
          value={String(due.length)}
          href="/dashboard/checkups"
          loading={loading && due.length === 0}
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Work queue: due checkups as dense list */}
        <section aria-labelledby="due-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2
              id="due-heading"
              className="font-display text-lg font-bold text-ink"
            >
              Checkups due
            </h2>
            <Link
              href="/dashboard/checkups"
              className="text-sm font-semibold text-mc-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface">
            {loading ?
              <p className="px-4 py-8 text-sm text-ink-muted">Loading…</p>
            : due.length === 0 ?
              <p className="px-4 py-8 text-sm text-ink-muted">
                No checkups overdue. Keep a steady cadence with your roster.
              </p>
            : <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="border-b border-line bg-paper-elevated/80 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Client</th>
                      <th className="px-4 py-2.5 font-semibold">Status</th>
                      <th className="sr-only px-4 py-2.5 font-semibold">
                        Open
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {due.slice(0, 8).map((item) => (
                      <tr key={item.clientCode ?? item.name} className="group">
                        <td className="px-4 py-3">
                          <Link
                            href={
                              item.clientCode ?
                                `/dashboard/clients/${encodeURIComponent(item.clientCode)}`
                              : "/dashboard/clients"
                            }
                            className="font-semibold text-ink group-hover:text-[color:var(--mc-secondary-dark)]"
                          >
                            {item.name}
                          </Link>
                          {item.mobileNo ?
                            <p className="mt-0.5 text-xs text-ink-muted">
                              {item.mobileNo}
                            </p>
                          : null}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {item.daysOverdue > 0 ?
                            <span className="font-medium text-[color:var(--mc-destructive)]">
                              {item.daysOverdue}d overdue
                            </span>
                          : item.dueDate ?
                            `Due ${item.dueDate}`
                          : "Due soon"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={
                              item.clientCode ?
                                `/dashboard/clients/${encodeURIComponent(item.clientCode)}/checkup`
                              : "/dashboard/checkups"
                            }
                            className="inline-flex items-center gap-1 text-sm font-semibold text-mc-secondary"
                            aria-label={`Start checkup for ${item.name}`}
                          >
                            Checkup
                            <ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>

        {/* Open leads queue */}
        <section aria-labelledby="leads-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2
              id="leads-heading"
              className="font-display text-lg font-bold text-ink"
            >
              Open leads
            </h2>
            <Link
              href="/dashboard/leads"
              className="text-sm font-semibold text-mc-secondary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface">
            {loading ?
              <p className="px-4 py-8 text-sm text-ink-muted">Loading…</p>
            : openLeads.length === 0 ?
              <div className="px-4 py-8">
                <p className="text-sm text-ink-muted">
                  No open enquiries. Share your public profile to attract leads.
                </p>
                {session?.coachCode ?
                  <Link
                    href={`/coach/${encodeURIComponent(session.coachCode)}`}
                    className="mt-3 inline-flex text-sm font-semibold text-mc-secondary hover:underline"
                  >
                    Open public profile
                  </Link>
                : null}
              </div>
            : <ul className="divide-y divide-line">
                {openLeads.slice(0, 6).map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href="/dashboard/leads"
                      className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-paper focus-visible:bg-paper"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {lead.clientName}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {lead.lookingFor || lead.clientMobile || "Enquiry"}
                          {lead.dateLabel ? `, ${lead.dateLabel}` : ""}
                        </p>
                      </div>
                      <ArrowRight
                        className="size-4 shrink-0 text-ink-muted"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            }
          </div>
        </section>
      </div>

      {/* Recent clients table - web roster preview */}
      <section className="mt-10" aria-labelledby="roster-heading">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2
            id="roster-heading"
            className="font-display text-lg font-bold text-ink"
          >
            Recent clients
          </h2>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
          >
            <Users className="size-3.5" aria-hidden />
            Full roster
          </Link>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface">
          {loading ?
            <p className="px-4 py-8 text-sm text-ink-muted">Loading…</p>
          : recentClients.length === 0 ?
            <div className="flex flex-col items-start gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-muted">
                No clients yet. Add someone to start assessments and plans.
              </p>
              <button
                type="button"
                disabled={checking}
                onClick={() => void openAddClient()}
                className="mc-btn-primary"
              >
                <Plus className="size-4" aria-hidden />
                Add client
              </button>
            </div>
          : <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="border-b border-line bg-paper-elevated/80 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Contact</th>
                    <th className="px-4 py-2.5 font-semibold">Age</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="sr-only px-4 py-2.5 font-semibold">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentClients.map((client) => {
                    const code = client.clientCode;
                    if (!code) return null;
                    return (
                      <tr key={code} className="hover:bg-paper/80">
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/clients/${encodeURIComponent(code)}`}
                            className="font-semibold text-ink hover:text-[color:var(--mc-secondary-dark)]"
                          >
                            {client.name || "Unnamed client"}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {client.mobileNo || "-"}
                        </td>
                        <td className="px-4 py-3 text-ink-muted tabular-nums">
                          {client.age != null ? client.age : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {client.status ?
                            <span className="mc-chip !min-h-0 !py-1 !text-[11px]">
                              {client.status}
                            </span>
                          : <span className="text-ink-muted">-</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/clients/${encodeURIComponent(code)}`}
                            className="text-sm font-semibold text-mc-secondary"
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
          }
        </div>
      </section>
    </div>
  );
}
