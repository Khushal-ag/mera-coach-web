"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowRight, ClipboardCheck, Inbox, Plus, Users } from "lucide-react";

import type {
  ClientSummary,
  EnquiryLead,
  RecheckupDueClient,
} from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { photography } from "@/config/photography";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import {
  fetchAuthedCoachProfile,
  fetchClientList,
  fetchEnquiryLeads,
  fetchRecheckupList,
} from "@/lib/api/practice";
import { getProfileCompletion } from "@/lib/profile-completion";

function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function attentionLine({
  loading,
  due,
  leads,
  clients,
}: {
  loading: boolean;
  due: number;
  leads: number;
  clients: number;
}) {
  if (loading && due === 0 && leads === 0 && clients === 0) {
    return "Checking who needs you today.";
  }
  const parts: string[] = [];
  if (due > 0) {
    parts.push(due === 1 ? "1 checkup is due" : `${due} checkups are due`);
  }
  if (leads > 0) {
    parts.push(leads === 1 ? "1 lead is open" : `${leads} leads are open`);
  }
  if (parts.length > 0) {
    return `${parts.join(", and ")}. Start there, or add a client.`;
  }
  if (clients === 0) return "Add your first client to start an assessment.";
  return "You're caught up. Add a client when someone new is ready to train.";
}

function MetricCard({
  label,
  value,
  hint,
  href,
  loading,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  loading?: boolean;
  tone: "teal" | "amber" | "terracotta";
  icon: React.ReactNode;
}) {
  const iconClass =
    tone === "amber" ? "bg-[color:var(--mc-accent)]"
    : tone === "terracotta" ? "bg-mc-primary"
    : "bg-mc-secondary";
  const accent =
    tone === "amber" ? "border-l-[color:var(--mc-accent)]"
    : tone === "terracotta" ? "border-l-mc-primary"
    : "border-l-mc-secondary";
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-[16px] border border-l-4 border-line bg-white p-4 shadow-[0_8px_24px_rgba(23,134,118,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,134,118,0.1)] ${accent}`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl text-white ${iconClass}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        {loading ?
          <span className="mc-skeleton block h-8 w-12" />
        : <span className="block font-display text-3xl font-extrabold tracking-tight text-ink tabular-nums">
            {value}
          </span>
        }
        <span className="block font-display text-sm font-bold text-ink">
          {label}
        </span>
        <span className="block text-xs text-ink-muted">{hint}</span>
      </span>
    </Link>
  );
}

function SectionHead({
  id,
  title,
  href,
  action,
}: {
  id: string;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="font-display text-lg font-bold text-ink">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary hover:underline"
      >
        {action}
      </Link>
    </div>
  );
}

function DashboardIntro({
  greeting,
  firstName,
  attention,
  checking,
  onAdd,
}: {
  greeting: string;
  firstName: string;
  attention: string;
  checking: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
        <span className="font-display text-base font-bold text-ink">
          {greeting}, {firstName}.
        </span>{" "}
        {attention}
      </p>
      <button
        type="button"
        disabled={checking}
        onClick={onAdd}
        className="mc-btn-primary w-full shrink-0 sm:w-auto"
      >
        <Plus className="size-4" strokeWidth={2.25} aria-hidden />
        {checking ? "Checking…" : "Add client"}
      </button>
    </div>
  );
}

function DashboardIntroLive({
  firstName,
  attention,
  checking,
  onAdd,
}: {
  firstName: string;
  attention: string;
  checking: boolean;
  onAdd: () => void;
}) {
  return (
    <DashboardIntro
      greeting={greetingFor(new Date())}
      firstName={firstName}
      attention={attention}
      checking={checking}
      onAdd={onAdd}
    />
  );
}

function dueLabel(item: RecheckupDueClient) {
  if (item.daysOverdue > 0) return `${item.daysOverdue}d overdue`;
  if (item.dueDate) return `Due ${item.dueDate}`;
  return "Due soon";
}

export function DashboardHomeView() {
  const { session } = useAuth();
  const { openAddClient, checking, error: gateError } = useOpenAddClient();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
  const [due, setDue] = useState<RecheckupDueClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<"unknown" | "on" | "off">("unknown");
  const [listingMissing, setListingMissing] = useState<string[]>([]);

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
        fetchAuthedCoachProfile(),
      ]).then((results) => {
        if (cancelled) return;
        const [c, l, d, profileResult] = results;
        if (c.status === "fulfilled") setClients(c.value);
        if (l.status === "fulfilled") setLeads(l.value);
        if (d.status === "fulfilled") setDue(d.value);
        if (profileResult.status === "fulfilled" && profileResult.value) {
          const coach = profileResult.value;
          const completion = getProfileCompletion({
            coachName: coach.coachName,
            coachTypeCode: coach.coachTypeCode,
            city_Cd: coach.city_Cd,
            tagline: coach.tagline,
            coachDesc: coach.coachDesc,
            serviceCodes: coach.serviceCodes,
            experienceYears: coach.experienceYears,
            happyClientCount: coach.happyClientCount,
            pinCode: coach.pinCode,
            locality: coach.locality,
            add_Line: coach.add_Line,
            profile_Pic_Url: coach.profile_Pic_Url,
            isProfileVisible: coach.isProfileVisible,
            missingPublicFields: coach.missingPublicFields,
          });
          setListing(coach.isProfileVisible === false ? "off" : "on");
          setListingMissing(completion.missingLabels);
        }
        const metricFailures = [c, l, d].filter((r) => r.status === "rejected");
        if (metricFailures.length === 3) {
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
  const dueSorted = useMemo(
    () => [...due].sort((a, b) => b.daysOverdue - a.daysOverdue),
    [due],
  );

  const firstName = session?.fullName?.split(" ")[0] || "Coach";
  const attention = attentionLine({
    loading,
    due: due.length,
    leads: openLeads.length,
    clients: clients.length,
  });
  const recentClients = clients.slice(0, 8);
  const duePreview = dueSorted.slice(0, 6);
  const leadPreview = openLeads.slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Suspense
        fallback={
          <DashboardIntro
            greeting="Hello"
            firstName={firstName}
            attention={attention}
            checking={checking}
            onAdd={() => void openAddClient()}
          />
        }
      >
        <DashboardIntroLive
          firstName={firstName}
          attention={attention}
          checking={checking}
          onAdd={() => void openAddClient()}
        />
      </Suspense>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {gateError ?
        <AlertBanner tone="error">{gateError}</AlertBanner>
      : null}

      <section aria-label="Key metrics" className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total clients"
          hint="On your roster"
          value={String(clients.length)}
          href="/dashboard/clients"
          loading={loading && clients.length === 0}
          tone="teal"
          icon={<Users className="size-5" aria-hidden />}
        />
        <MetricCard
          label="Open leads"
          hint="Waiting on you"
          value={String(openLeads.length)}
          href="/dashboard/leads"
          loading={loading && leads.length === 0}
          tone="amber"
          icon={<Inbox className="size-5" aria-hidden />}
        />
        <MetricCard
          label="Checkups due"
          hint={due.length > 0 ? "Follow up today" : "None waiting"}
          value={String(due.length)}
          href="/dashboard/checkups"
          loading={loading && due.length === 0}
          tone="terracotta"
          icon={<ClipboardCheck className="size-5" aria-hidden />}
        />
      </section>

      <div className="mt-5 rounded-[var(--radius-md)] border border-mc-secondary/20 bg-mc-secondary-light px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              {listing === "off" ?
                "Your listing is off until the profile is complete"
              : <>
                  Coaches with a complete profile{" "}
                  <span className="text-mc-primary">get found first</span>
                </>
              }
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
              {listing === "off" ?
                listingMissing.length ?
                  `Save these details on your profile: ${listingMissing.join(", ")}. Find a Coach lists a profile once every required field is saved.`
                : "Save your profile again. Find a Coach lists a profile once every required field is saved."

              : "Photo, services, and city are what people read before they enquire."
              }
            </p>
          </div>
          <Link
            href={
              listing === "on" && session?.coachCode ?
                `/coach/${encodeURIComponent(session.coachCode)}`
              : "/dashboard/profile"
            }
            className="mc-btn-primary w-full shrink-0 sm:w-auto"
          >
            {listing === "on" ? "Open public profile" : "Update profile"}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:gap-5 lg:gap-6">
        <section aria-labelledby="due-heading" className="min-w-0">
          <SectionHead
            id="due-heading"
            title="Checkups due"
            href="/dashboard/checkups"
            action="View all"
          />
          {loading ?
            <PracticeRosterSkeleton rows={4} />
          : duePreview.length === 0 ?
            <PracticeEmpty
              title="No checkups overdue"
              body="Due clients will show up here when a follow-up is waiting."
            />
          : <>
              <ul className="mc-roster divide-y divide-line md:hidden">
                {duePreview.map((item) => {
                  const clientHref =
                    item.clientCode ?
                      `/dashboard/clients/${encodeURIComponent(item.clientCode)}`
                    : "/dashboard/clients";
                  const checkupHref =
                    item.clientCode ?
                      `/dashboard/clients/${encodeURIComponent(item.clientCode)}/checkup`
                    : "/dashboard/checkups";
                  return (
                    <li
                      key={item.clientCode ?? item.name}
                      className="px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={clientHref}
                            className="inline-flex min-h-11 items-center font-semibold text-ink"
                          >
                            {item.name}
                          </Link>
                          {item.mobileNo ?
                            <p className="text-xs text-ink-muted">
                              {item.mobileNo}
                            </p>
                          : null}
                          <p
                            className={
                              item.daysOverdue > 0 ?
                                "mt-1 text-sm font-medium text-[color:var(--mc-destructive)]"
                              : "mt-1 text-sm text-ink-muted"
                            }
                          >
                            {dueLabel(item)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={checkupHref}
                        className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-mc-secondary"
                        aria-label={`Start checkup for ${item.name}`}
                      >
                        Start checkup
                        <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mc-roster hidden md:block">
                <table className="w-full text-left text-sm">
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
                    {duePreview.map((item) => (
                      <tr key={item.clientCode ?? item.name}>
                        <td className="px-4 py-2">
                          <Link
                            href={
                              item.clientCode ?
                                `/dashboard/clients/${encodeURIComponent(item.clientCode)}`
                              : "/dashboard/clients"
                            }
                            className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-mc-secondary"
                          >
                            {item.name}
                          </Link>
                          {item.mobileNo ?
                            <p className="-mt-1 text-xs text-ink-muted">
                              {item.mobileNo}
                            </p>
                          : null}
                        </td>
                        <td className="px-4 py-2 text-ink-muted">
                          {item.daysOverdue > 0 ?
                            <span className="font-medium text-[color:var(--mc-destructive)]">
                              {dueLabel(item)}
                            </span>
                          : dueLabel(item)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={
                              item.clientCode ?
                                `/dashboard/clients/${encodeURIComponent(item.clientCode)}/checkup`
                              : "/dashboard/checkups"
                            }
                            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-mc-secondary"
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
            </>
          }
        </section>

        <section aria-labelledby="leads-heading" className="min-w-0">
          <SectionHead
            id="leads-heading"
            title="Open leads"
            href="/dashboard/leads"
            action="View all"
          />
          {loading ?
            <PracticeRosterSkeleton rows={4} />
          : leadPreview.length === 0 ?
            <PracticeEmpty
              image={photography.emptyLeads}
              imageAlt="A coach holding a phone between sessions"
              title="No open enquiries"
              body={
                listing === "off" ?
                  "Your Find a Coach listing is off until the required profile details are saved."
                : "Share your public profile so new clients can reach you."
              }
              href={
                listing === "on" && session?.coachCode ?
                  `/coach/${encodeURIComponent(session.coachCode)}`
                : "/dashboard/profile"
              }
              cta={listing === "on" ? "Open profile" : "Update profile"}
            />
          : <ul className="mc-roster divide-y divide-line">
              {leadPreview.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href="/dashboard/leads"
                    className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 transition hover:bg-paper focus-visible:bg-paper"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {lead.clientName}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {lead.lookingFor || lead.clientMobile || "Enquiry"}
                        {lead.dateLabel ? ` · ${lead.dateLabel}` : ""}
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
        </section>
      </div>

      <section
        className="mt-8 min-w-0 md:mt-10"
        aria-labelledby="roster-heading"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id="roster-heading"
            className="font-display text-lg font-bold text-ink"
          >
            Recent clients
          </h2>
          <Link
            href="/dashboard/clients"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
          >
            <Users className="size-3.5" aria-hidden />
            Full roster
          </Link>
        </div>
        {loading ?
          <PracticeRosterSkeleton rows={5} />
        : recentClients.length === 0 ?
          <PracticeEmpty
            image={photography.emptyClients}
            imageAlt="A folded towel and a closed notebook on a gym bench"
            title="No clients yet"
            body="Use Add client above to start an assessment."
          />
        : <>
            <ul className="mc-roster divide-y divide-line md:hidden">
              {recentClients.map((client) => {
                const code = client.clientCode;
                if (!code) return null;
                return (
                  <li key={code}>
                    <Link
                      href={`/dashboard/clients/${encodeURIComponent(code)}`}
                      className="flex min-h-11 items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {client.name || "Unnamed client"}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {[
                            client.mobileNo,
                            client.age != null ? `${client.age} yrs` : null,
                            client.status,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "No contact details"}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-mc-secondary">
                        Open
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mc-roster hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="mc-roster-head">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Contact</th>
                    <th className="hidden px-4 py-2.5 font-semibold lg:table-cell">
                      Age
                    </th>
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
                        <td className="px-4 py-2">
                          <Link
                            href={`/dashboard/clients/${encodeURIComponent(code)}`}
                            className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-mc-secondary"
                          >
                            {client.name || "Unnamed client"}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-ink-muted">
                          {client.mobileNo || "-"}
                        </td>
                        <td className="hidden px-4 py-2 text-ink-muted tabular-nums lg:table-cell">
                          {client.age != null ? client.age : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {client.status ?
                            <span className="mc-chip !min-h-0 !py-1 !text-[11px]">
                              {client.status}
                            </span>
                          : <span className="text-ink-muted">-</span>}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/dashboard/clients/${encodeURIComponent(code)}`}
                            className="inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary"
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
          </>
        }
      </section>
    </div>
  );
}
