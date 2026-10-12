"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { RecheckupDueClient } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeRosterSkeleton,
  PracticeSearch,
} from "@/components/practice/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { fetchRecheckupList } from "@/lib/api/practice";

export function CheckupsDueView() {
  const { session } = useAuth();
  const [due, setDue] = useState<RecheckupDueClient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void fetchRecheckupList({ coachCode })
        .then((rows) => {
          if (!cancelled) setDue(rows);
        })
        .catch((err) => {
          if (!cancelled)
            setError(
              err instanceof Error ? err.message : "Could not load checkups.",
            );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return due;
    return due.filter(
      (d) => d.name.toLowerCase().includes(q) || (d.mobileNo ?? "").includes(q),
    );
  }, [due, search]);

  return (
    <div className="mx-auto max-w-5xl">
      <PracticePageHeader
        title="Checkups due"
        description="Start a recheckup for clients who need a follow-up assessment."
      />

      <div className="mb-4">
        <PracticeSearch
          id="checkup-search"
          label="Search checkups"
          placeholder="Name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}

      <div>
        {loading ?
          <PracticeRosterSkeleton rows={5} />
        : filtered.length === 0 ?
          <PracticeEmpty
            title={search.trim() ? "No matches" : "No checkups due"}
            body={
              search.trim() ?
                "Try a different name or mobile number."
              : "No clients are due for a re-checkup right now."
            }
          />
        : <div className="mc-roster overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="mc-roster-head">
                <tr>
                  <th className="px-4 py-2.5">Client</th>
                  <th className="px-4 py-2.5">Last checkup</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="sr-only px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((item) => (
                  <tr key={item.clientCode ?? item.name}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{item.name}</p>
                      {item.mobileNo ?
                        <p className="text-xs text-ink-muted">
                          {item.mobileNo}
                        </p>
                      : null}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {item.lastCheckupDate || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {item.daysOverdue > 0 ?
                        <span className="font-medium text-[color:var(--mc-destructive)]">
                          {item.daysOverdue}d overdue
                        </span>
                      : item.dueDate ?
                        `Due ${item.dueDate}`
                      : "Due soon"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.clientCode ?
                        <Link
                          href={`/dashboard/clients/${encodeURIComponent(item.clientCode)}/checkup`}
                          className="inline-flex items-center gap-1 font-semibold text-mc-secondary"
                        >
                          Start checkup
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}
