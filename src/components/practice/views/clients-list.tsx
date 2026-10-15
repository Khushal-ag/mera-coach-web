"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { ClientSummary } from "@/types/practice";

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
import { AVATAR_COLORS } from "@/constants/brand";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import { fetchClientList } from "@/lib/api/practice";
import { initials } from "@/lib/format";

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function weightLabel(weight?: string) {
  if (!weight) return "-";
  const n = Number(weight);
  return Number.isFinite(n) ? n.toFixed(1) : weight;
}

export function ClientsListView() {
  const { session } = useAuth();
  const { openAddClient, error: gateError } = useOpenAddClient();
  const [rows, setRows] = useState<ClientSummary[] | null>(null);
  const [option, setOption] = useState("");
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ option: "", text: "" });

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void fetchClientList({
        coachCode,
        searchOption: search.option,
        searchText: search.text,
      })
        .then((list) => {
          if (!cancelled) setRows(list);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof Error ? err.message : "Failed to load clients.",
            );
            setRows([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode, search]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows ?? [];
    if (!q) return list;
    return list.filter((client) =>
      [client.name, client.mobileNo, client.age, client.height, client.weight]
        .filter((value) => value != null)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const { sorted, sort, toggle } = useSortedRows(filtered, {
    sno: (c: ClientSummary) => filtered.indexOf(c),
    name: (c: ClientSummary) => c.name,
    mobile: (c: ClientSummary) => c.mobileNo,
    age: (c: ClientSummary) => c.age,
    height: (c: ClientSummary) => c.height,
    weight: (c: ClientSummary) => c.weight,
    last: (c: ClientSummary) => c.lastCheckupDate,
  });
  const paged = usePagedRows(sorted, perPage);
  const badge =
    rows == null ? "Loading…" : (
      `${paged.total} Client${paged.total === 1 ? "" : "s"}`
    );

  return (
    <div>
      <CltPageHead
        title="Clients"
        crumb="Clients"
        action={
          <button
            type="button"
            className="clt-btn clt-btn-primary"
            onClick={() => void openAddClient()}
          >
            <i className="fas fa-user-plus" /> Add New Client
          </button>
        }
      />
      {error ?
        <p className="rg-alert">{error}</p>
      : null}
      {gateError ?
        <p className="rg-alert">{gateError}</p>
      : null}
      <CltSearchCard
        optionId="cltSearchOption"
        textId="cltSearchText"
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
            <i className="fas fa-list" /> Client List
          </h2>
          <span className="clt-total-badge">{badge}</span>
        </div>
        <div className="clt-card-body">
          <CltTableTools
            selectId="cltEntriesSelect"
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
                    label="Height"
                    sortKey="height"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Weight"
                    sortKey="weight"
                    sort={sort}
                    onSort={toggle}
                  />
                  <CltSortTh
                    label="Last Check-up"
                    sortKey="last"
                    sort={sort}
                    onSort={toggle}
                  />
                  <th>Check-up</th>
                  <th>Report</th>
                  <th>Diet Chart</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows == null ?
                  <TableSkeletonRows columns={10} />
                : paged.slice.length === 0 ?
                  <tr className="clt-no-results">
                    <td colSpan={10}>
                      <i className="fas fa-user-slash" />
                      No clients found.
                    </td>
                  </tr>
                : paged.slice.map((client, index) => {
                    const code = client.clientCode;
                    if (!code) return null;
                    const checkupHref = `/dashboard/clients/${encodeURIComponent(code)}/checkup`;
                    const reportHref = `/dashboard/clients/${encodeURIComponent(code)}?tab=bmi`;
                    const dietReady = Boolean(
                      client.hasLifestyle && client.hasDiet,
                    );
                    return (
                      <tr key={code}>
                        <td className="clt-td-sno">
                          {paged.start + index + 1}
                        </td>
                        <td>
                          <Link
                            href={`/dashboard/clients/${encodeURIComponent(code)}`}
                            className="clt-client-name"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <div
                              className="clt-name-avatar"
                              style={{
                                background: avatarColor(client.name || code),
                              }}
                            >
                              {initials(client.name || code)}
                            </div>
                            {client.name || "-"}
                          </Link>
                        </td>
                        <td>
                          {client.mobileNo ?
                            <a
                              href={`tel:${client.mobileNo}`}
                              className="clt-mobile-link"
                            >
                              {client.mobileNo}
                            </a>
                          : "-"}
                        </td>
                        <td className="clt-td-num">{client.age ?? "-"}</td>
                        <td className="clt-td-num">{client.height || "-"}</td>
                        <td className="clt-td-num">
                          {weightLabel(client.weight)}
                        </td>
                        <td>
                          {client.lastCheckupDate ?
                            <span className="clt-date-badge">
                              <i className="fas fa-calendar-alt" />
                              &nbsp;{client.lastCheckupDate}
                            </span>
                          : <span style={{ color: "#b8a898", fontSize: 12 }}>
                              No check-up
                            </span>
                          }
                        </td>
                        <td>
                          <Link
                            href={checkupHref}
                            className="clt-action-btn clt-ab-checkup"
                            title="Check-up"
                          >
                            <i className="fas fa-clipboard-list" />
                          </Link>
                        </td>
                        <td>
                          <Link
                            href={reportHref}
                            className="clt-action-btn clt-ab-report"
                            title="View BMI Report"
                          >
                            <i className="fas fa-chart-bar" />
                          </Link>
                        </td>
                        <td>
                          {dietReady ?
                            <Link
                              href={`/dashboard/clients/${encodeURIComponent(code)}/diet`}
                              className="clt-action-btn clt-ab-report"
                              title="View Diet Chart"
                            >
                              <i className="fas fa-utensils" />
                            </Link>
                          : <span
                              className="clt-action-btn"
                              style={{ opacity: 0.3, cursor: "not-allowed" }}
                              title="Lifestyle & Current Diet not captured yet"
                            >
                              <i className="fas fa-utensils" />
                            </span>
                          }
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
