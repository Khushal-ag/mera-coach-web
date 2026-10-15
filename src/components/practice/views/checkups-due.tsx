"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { RecheckupDueClient } from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import {
  CltPageHead,
  CltPager,
  CltSearchCard,
  CltSortTh,
  CltTableTools,
  usePagedRows,
  useSortedRows,
} from "@/components/practice/clt-list";
import { TableSkeletonRows } from "@/components/skeletons/client-profile-skeleton";
import { fetchRecheckupList } from "@/lib/api/practice";

export function CheckupsDueView() {
  const { session } = useAuth();
  const [due, setDue] = useState<RecheckupDueClient[] | null>(null);
  const [option, setOption] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState({ option: "", text: "" });

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setError(null);
      void fetchRecheckupList({
        coachCode,
        searchOption: search.option,
        searchText: search.text,
      })
        .then((rows) => {
          if (!cancelled) setDue(rows);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to load list.",
            );
            setDue([]);
          }
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode, search]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = due ?? [];
    if (!q) return list;
    return list.filter((item) =>
      [item.name, item.mobileNo, item.age, item.lastCheckupDate, item.dueDate]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [due, query]);

  const { sorted, sort, toggle } = useSortedRows(filtered, {
    sno: (c: RecheckupDueClient) => filtered.indexOf(c),
    name: (c: RecheckupDueClient) => c.name,
    mobile: (c: RecheckupDueClient) => c.mobileNo,
    age: (c: RecheckupDueClient) => c.age,
    last: (c: RecheckupDueClient) => c.lastCheckupDate,
    due: (c: RecheckupDueClient) => c.dueDate,
    overdue: (c: RecheckupDueClient) => c.daysOverdue,
  });
  const paged = usePagedRows(sorted, perPage);
  const badge = due == null ? "Loading…" : `${paged.total} Due`;

  return (
    <div>
      <CltPageHead title="Re-checkup Due" crumb="Re-checkup" />
      {error ?
        <p className="rg-alert">{error}</p>
      : null}
      <CltSearchCard
        optionId="rcSearchOption"
        textId="rcSearchText"
        option={option}
        text={text}
        onOption={setOption}
        onText={setText}
        onSearch={() => {
          setSearch({ option, text: text.trim() });
          paged.setPage(1);
        }}
        onReset={() => {
          setOption("");
          setText("");
          setQuery("");
          setSearch({ option: "", text: "" });
          paged.setPage(1);
        }}
      />
      <div className="clt-card">
        <div className="clt-card-header">
          <h2>
            <i className="fas fa-redo-alt" /> Due for Re-checkup
          </h2>
          <span className="clt-total-badge">{badge}</span>
        </div>
        <div className="clt-card-body">
          <CltTableTools
            selectId="rcEntriesSelect"
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
            <table className="clt-table">
              <thead>
                <tr>
                  <CltSortTh
                    label="S. No."
                    sortKey="sno"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Client Name"
                    sortKey="name"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Mobile No."
                    sortKey="mobile"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Age"
                    sortKey="age"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Last Check-up"
                    sortKey="last"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Due Date"
                    sortKey="due"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Overdue By"
                    sortKey="overdue"
                    sort={sort}
                    onSort={toggle}
                  />
                  <th>Check-up</th>
                </tr>
              </thead>
              <tbody>
                {due == null ?
                  <TableSkeletonRows columns={8} />
                : paged.slice.length === 0 ?
                  <tr className="clt-no-results">
                    <td colSpan={8}>
                      <i className="fas fa-check-circle" />
                      No clients due for re-checkup.
                    </td>
                  </tr>
                : paged.slice.map((item, index) => {
                    const code = item.clientCode;
                    return (
                      <tr key={code ?? `${item.name}-${index}`}>
                        <td className="clt-td-sno">
                          {paged.start + index + 1}
                        </td>
                        <td>
                          {code ?
                            <Link
                              href={`/dashboard/clients/${encodeURIComponent(code)}`}
                              className="clt-mobile-link"
                            >
                              {item.name || "-"}
                            </Link>
                          : item.name || "-"}
                        </td>
                        <td>
                          {item.mobileNo ?
                            <a
                              href={`tel:${item.mobileNo}`}
                              className="clt-mobile-link"
                            >
                              {item.mobileNo}
                            </a>
                          : "-"}
                        </td>
                        <td className="clt-td-num">{item.age ?? "-"}</td>
                        <td>
                          {item.lastCheckupDate ?
                            <span className="clt-date-badge">
                              <i className="fas fa-calendar-alt" />
                              &nbsp;{item.lastCheckupDate}
                            </span>
                          : "-"}
                        </td>
                        <td>
                          {item.dueDate ?
                            <span className="clt-date-badge">
                              <i className="fas fa-bell" />
                              &nbsp;{item.dueDate}
                            </span>
                          : "-"}
                        </td>
                        <td
                          className="clt-td-num"
                          style={{ color: "#c0392b", fontWeight: 600 }}
                        >
                          {item.daysOverdue > 0 ?
                            `${item.daysOverdue} day${item.daysOverdue === 1 ? "" : "s"}`
                          : "Today"}
                        </td>
                        <td>
                          {code ?
                            <Link
                              href={`/dashboard/clients/${encodeURIComponent(code)}/checkup`}
                              className="clt-action-btn clt-ab-checkup"
                              title="Check-up"
                            >
                              <i className="fas fa-clipboard-list" />
                            </Link>
                          : "-"}
                        </td>
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
