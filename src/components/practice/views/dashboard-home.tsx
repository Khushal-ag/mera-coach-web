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
import {
  PracticeEmpty,
  PracticePageHeader,
  practicePhotos,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
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
  tone = "ink",
}: {
  label: string;
  value: string;
  href: string;
  loading?: boolean;
  tone?: "ink" | "alert";
}) {
  return (
    <Link href={href} className="mc-stat">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      {loading ?
        <span className="mc-skeleton mt-1 h-8 w-14" />
      : <span
          className={
            tone === "alert" ?
              "font-display text-3xl font-bold tracking-tight text-[color:var(--mc-destructive)] tabular-nums"
            : "font-display text-3xl font-bold tracking-tight text-ink tabular-nums"
          }
        >
          {value}
        </span>
      }
    </Link>
  );
}

export function DashboardHomeView() {
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
      <PracticePageHeader
        variant="band"
        image={practicePhotos.overview}
        title="Dashboard"
        description={`${greetingFor()}, ${firstName}. What needs attention with your clients today.`}
        action={
          <button
            type="button"
            disabled={checking}
            onClick={() => void openAddClient()}
            className="mc-btn-primary shrink-0"
          >
            <Plus className="size-4" strokeWidth={2.25} aria-hidden />
            {checking ? "Checking…" : "Add client"}
          </button>
        }
      />

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {gateError ?
        <AlertBanner tone="error">{gateError}</AlertBanner>
      : null}

      <section aria-label="Key metrics" className="mc-stat-strip">
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
          tone={!loading && due.length > 0 ? "alert" : "ink"}
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
          <div>
            {loading ?
              <PracticeRosterSkeleton rows={4} />
            : due.length === 0 ?
              <PracticeEmpty
                title="No checkups overdue"
                body="Due clients will show up here when a follow-up is waiting."
              />
            : <div className="mc-roster overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="mc-roster-head">
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
          <div>
            {loading ?
              <PracticeRosterSkeleton rows={4} />
            : openLeads.length === 0 ?
              <PracticeEmpty
                title="No open enquiries"
                body="Share your public profile so new clients can reach you."
                href={
                  session?.coachCode ?
                    `/coach/${encodeURIComponent(session.coachCode)}`
                  : "/dashboard/profile"
                }
                cta="Open profile"
              />
            : <ul className="mc-roster divide-y divide-line">
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
        <div>
          {loading ?
            <PracticeRosterSkeleton rows={5} />
          : recentClients.length === 0 ?
            <PracticeEmpty
              title="No clients yet"
              body="Use Add client above to start an assessment."
            />
          : <div className="mc-roster overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="mc-roster-head">
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
