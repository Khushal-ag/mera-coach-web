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
                      .join(" · ") || "No contact details"}
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
                    href={`/dashboard/clients/${encodeURIComponent(item.clientCode)}/checkup`}
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
    </div>
  );
}
