"use client";

import { useEffect, useMemo, useState } from "react";

import type { EnquiryLead } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  CltPageHead,
  CltPager,
  CltSortTh,
  CltTableTools,
  usePagedRows,
  useSortedRows,
} from "@/components/practice/clt-list";
import { TableSkeletonRows } from "@/components/skeletons/client-profile-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchEnquiryLeads, updateEnquiryLead } from "@/lib/api/practice";

export function LeadsListView() {
  const { session } = useAuth();
  const [leads, setLeads] = useState<EnquiryLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
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
              err instanceof Error ? err.message : "Failed to load leads.",
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = leads ?? [];
    if (!q) return list;
    return list.filter((lead) =>
      [
        lead.clientName,
        lead.clientMobile,
        lead.clientEmail,
        lead.lookingFor,
        lead.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [leads, query]);

  const { sorted, sort, toggle } = useSortedRows(filtered, {
    date: (l: EnquiryLead) => l.dateLabel,
    name: (l: EnquiryLead) => l.clientName,
  });
  const paged = usePagedRows(sorted, perPage);
  const badge =
    leads == null ? "Loading…" : (
      `${paged.total} Lead${paged.total === 1 ? "" : "s"}`
    );

  async function toggleContacted(lead: EnquiryLead, checked: boolean) {
    setSavingId(lead.id);
    try {
      await updateEnquiryLead({ leadId: lead.id, isContacted: checked });
      setLeads((prev) =>
        (prev ?? []).map((item) =>
          item.id === lead.id ? { ...item, isContacted: checked } : item,
        ),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update lead.");
    } finally {
      setSavingId(null);
    }
  }

  async function saveNotes(lead: EnquiryLead, notes: string) {
    if (notes === lead.notes) return;
    setSavingId(lead.id);
    try {
      await updateEnquiryLead({ leadId: lead.id, notes });
      setLeads((prev) =>
        (prev ?? []).map((item) =>
          item.id === lead.id ? { ...item, notes } : item,
        ),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save notes.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <CltPageHead title="Leads" crumb="Leads" />
      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      <div className="clt-card">
        <div className="clt-card-header">
          <h2>
            <i className="fas fa-filter" /> Enquiry Leads
          </h2>
          <span className="clt-total-badge">{badge}</span>
        </div>
        <div className="clt-card-body">
          <CltTableTools
            selectId="ldEntriesSelect"
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
            <table className="clt-table clt-table--leads">
              <thead>
                <tr>
                  <CltSortTh
                    label="Date"
                    sortKey="date"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Name"
                    sortKey="name"
                    sort={sort}
                    onSort={toggle}
                  />
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Looking For</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {leads == null ?
                  <TableSkeletonRows columns={7} />
                : paged.slice.length === 0 ?
                  <tr className="clt-no-results">
                    <td colSpan={7}>
                      <i className="fas fa-inbox" />
                      No leads found.
                    </td>
                  </tr>
                : paged.slice.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.dateLabel || "-"}</td>
                      <td>{lead.clientName || "-"}</td>
                      <td>
                        {lead.clientMobile ?
                          <a
                            href={`tel:${lead.clientMobile}`}
                            className="clt-mobile-link"
                          >
                            {lead.clientMobile}
                          </a>
                        : "-"}
                      </td>
                      <td>
                        {lead.clientEmail ?
                          <a href={`mailto:${lead.clientEmail}`}>
                            {lead.clientEmail}
                          </a>
                        : "-"}
                      </td>
                      <td>{lead.lookingFor || "-"}</td>
                      <td>
                        <label className="clt-status-check">
                          <input
                            type="checkbox"
                            checked={lead.isContacted}
                            disabled={savingId === lead.id}
                            onChange={(event) =>
                              void toggleContacted(lead, event.target.checked)
                            }
                          />
                          {lead.isContacted ? "Contacted" : "New"}
                        </label>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="clt-form-control clt-notes-input"
                          placeholder="Add note…"
                          defaultValue={lead.notes}
                          disabled={savingId === lead.id}
                          onBlur={(event) =>
                            void saveNotes(lead, event.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))
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
