"use client";

import { useEffect, useState } from "react";

import type { EnquiryLead } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeRosterSkeleton,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { photography } from "@/config/photography";
import { fetchEnquiryLeads, updateEnquiryLead } from "@/lib/api/practice";
import { cn } from "@/lib/utils";

export function LeadsListView() {
  const { session } = useAuth();
  const [leads, setLeads] = useState<EnquiryLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setError(null);
      void fetchEnquiryLeads(coachCode)
        .then((list) => {
          if (!cancelled) setLeads(list);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Could not load leads.",
            );
            setLeads([]);
          }
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode]);

  async function toggleContacted(lead: EnquiryLead) {
    setSavingId(lead.id);
    try {
      await updateEnquiryLead({
        leadId: lead.id,
        isContacted: !lead.isContacted,
      });
      setLeads((prev) =>
        (prev ?? []).map((l) =>
          l.id === lead.id ? { ...l, isContacted: !l.isContacted } : l,
        ),
      );
      setError(null);
      setNotice(lead.isContacted ? "Lead reopened." : "Marked as contacted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update lead.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveNotes(lead: EnquiryLead, notes: string) {
    setSavingId(lead.id);
    try {
      await updateEnquiryLead({ leadId: lead.id, notes });
      setLeads((prev) =>
        (prev ?? []).map((l) => (l.id === lead.id ? { ...l, notes } : l)),
      );
      setError(null);
      setNotice("Notes saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save notes.");
    } finally {
      setSavingId(null);
    }
  }

  const openCount = leads?.filter((l) => !l.isContacted).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PracticePageHeader
        title="Leads"
        description="Enquiries from your public profile and directory."
        action={
          leads != null && leads.length > 0 ?
            <p className="text-sm text-ink-muted tabular-nums">
              {openCount} open of {leads.length}
            </p>
          : undefined
        }
      />
      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      {notice ?
        <AlertBanner tone="success">{notice}</AlertBanner>
      : null}

      {leads == null ?
        <PracticeRosterSkeleton rows={5} />
      : !leads.length ?
        <PracticeEmpty
          image={photography.emptyLeads}
          imageAlt="A coach holding a phone between sessions"
          title="No leads yet"
          body="When someone enquires on your public page, they show up here."
          href="/dashboard/profile"
          cta="Share profile"
        />
      : <ul className="grid gap-3 lg:grid-cols-2">
          {leads.map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "mc-panel min-w-0 p-4 sm:p-5",
                lead.isContacted && "bg-paper/70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-ink">
                    {lead.clientName || "Lead"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {lead.dateLabel || "Recent"}
                    {lead.lookingFor ? ` · ${lead.lookingFor}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    lead.isContacted ?
                      "bg-paper-elevated text-ink-muted"
                    : "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
                  )}
                >
                  {lead.isContacted ? "Contacted" : "Open"}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-1 text-sm">
                {lead.clientMobile ?
                  <a
                    href={`tel:${lead.clientMobile}`}
                    className="inline-flex min-h-11 items-center font-semibold break-all text-mc-secondary hover:underline"
                  >
                    {lead.clientMobile}
                  </a>
                : null}
                {lead.clientEmail ?
                  <a
                    href={`mailto:${lead.clientEmail}`}
                    className="inline-flex min-h-11 items-center break-all text-ink-muted hover:text-mc-secondary"
                  >
                    {lead.clientEmail}
                  </a>
                : null}
              </div>
              <label className="mt-3 block">
                <span className="mc-field-label">
                  Notes for {lead.clientName || "this lead"}
                </span>
                <textarea
                  className="mc-field min-h-[4.5rem] w-full"
                  defaultValue={lead.notes}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (next !== lead.notes) void saveNotes(lead, next);
                  }}
                />
              </label>
              <button
                type="button"
                className="mc-btn-secondary mt-3 w-full sm:w-auto"
                disabled={savingId === lead.id}
                onClick={() => void toggleContacted(lead)}
              >
                {savingId === lead.id ?
                  "Saving"
                : lead.isContacted ?
                  "Reopen"
                : "Mark contacted"}
              </button>
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
