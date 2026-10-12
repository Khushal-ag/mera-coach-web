"use client";

import { useEffect, useState } from "react";

import type { EnquiryLead } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchEnquiryLeads, updateEnquiryLead } from "@/lib/api/practice";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const { session } = useAuth();
  const [leads, setLeads] = useState<EnquiryLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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

      {leads == null ?
        <p className="text-sm text-ink-muted">Loading leads…</p>
      : !leads.length ?
        <PracticeEmpty
          title="No leads yet"
          body="When someone enquires on your public page, they show up here."
          href="/dashboard/profile"
          cta="Share your profile"
        />
      : <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-line bg-paper-elevated/90 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Lead
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Looking for
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Notes
                  </th>
                  <th scope="col" className="sr-only px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      "align-top",
                      lead.isContacted && "bg-paper/50",
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-display font-bold text-ink">
                        {lead.clientName || "Lead"}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {lead.dateLabel || "Recent"}
                      </p>
                      {lead.clientMobile ?
                        <a
                          href={`tel:${lead.clientMobile}`}
                          className="mt-1 inline-block text-sm font-semibold text-mc-secondary hover:underline"
                        >
                          {lead.clientMobile}
                        </a>
                      : null}
                      {lead.clientEmail ?
                        <p className="text-xs text-ink-muted">
                          {lead.clientEmail}
                        </p>
                      : null}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {lead.lookingFor || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                          lead.isContacted ?
                            "bg-paper-elevated text-ink-muted"
                          : "bg-[color:var(--mc-accent-light)] text-[color:var(--mc-accent)]",
                        )}
                      >
                        {lead.isContacted ? "Contacted" : "Open"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <label className="block">
                        <span className="sr-only">
                          Notes for {lead.clientName}
                        </span>
                        <textarea
                          className="mc-field min-h-[4.5rem] w-full min-w-[12rem] text-sm"
                          defaultValue={lead.notes}
                          onBlur={(e) => {
                            const next = e.target.value.trim();
                            if (next !== lead.notes) void saveNotes(lead, next);
                          }}
                        />
                      </label>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="mc-btn-secondary !min-h-9 px-3 text-xs"
                        disabled={savingId === lead.id}
                        onClick={() => void toggleContacted(lead)}
                      >
                        {savingId === lead.id ?
                          "Saving…"
                        : lead.isContacted ?
                          "Reopen"
                        : "Mark contacted"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
}
