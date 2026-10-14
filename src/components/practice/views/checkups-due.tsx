"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ArrowRight, CalendarClock } from "lucide-react";

import type { RecheckupDueClient } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  PracticeEmpty,
  PracticePageHeader,
  PracticeSearch,
} from "@/components/practice/page-header";
import { CheckupListSkeleton } from "@/components/skeletons/table-skeleton";
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
    <div>
      <PracticePageHeader
        title="Checkups"
        description="Start a recheckup for clients who need a follow-up."
        icon={<CalendarClock className="size-5" aria-hidden />}
      />

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PracticeSearch
          id="checkup-search"
          label="Search"
          placeholder="Name or mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        {!loading ?
          <p className="text-sm text-ink-muted">{filtered.length} due</p>
        : null}
      </div>

      {error ?
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}

      {loading ?
        <CheckupListSkeleton rows={5} />
      : filtered.length === 0 ?
        <PracticeEmpty
          icon={<CalendarClock className="size-5" aria-hidden />}
          title={search.trim() ? "No matches" : "No checkups due"}
          body={
            search.trim() ?
              "Try a different name or mobile number."
            : "No clients are due for a re-checkup right now."
          }
        />
      : <ul className="mc-roster divide-y divide-line">
          {filtered.map((item) => (
            <li
              key={item.clientCode ?? item.name}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{item.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {[
                    item.mobileNo,
                    item.lastCheckupDate ?
                      `Last checkup ${item.lastCheckupDate}`
                    : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No contact details"}
                </p>
                <p
                  className={
                    item.daysOverdue > 0 ?
                      "mt-1 text-sm font-medium text-[color:var(--mc-destructive)]"
                    : "mt-1 text-sm text-ink-muted"
                  }
                >
                  {item.daysOverdue > 0 ?
                    `${item.daysOverdue}d overdue`
                  : item.dueDate ?
                    `Due ${item.dueDate}`
                  : "Due soon"}
                </p>
              </div>
              {item.clientCode ?
                <Link
                  href={`/dashboard/clients/${encodeURIComponent(item.clientCode)}?tab=checkup`}
                  className="inline-flex min-h-11 items-center justify-center gap-1 text-sm font-semibold text-mc-secondary sm:shrink-0"
                >
                  Start checkup
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              : null}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
