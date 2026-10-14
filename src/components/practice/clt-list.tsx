"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MenuSelect } from "@/components/ui/menu-select";

export function CltPageHead({
  title,
  crumb,
  action,
}: {
  title: string;
  crumb: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="clt-page-head">
      <div>
        <h1 className="clt-page-title">{title}</h1>
        <nav className="clt-breadcrumb">
          <Link href="/dashboard">
            <i className="fas fa-home" /> Home
          </Link>
          <i className="fas fa-chevron-right" />
          <span>{crumb}</span>
        </nav>
      </div>
      {action}
    </div>
  );
}

export function CltSearchCard({
  optionId,
  textId,
  option,
  text,
  onOption,
  onText,
  onSearch,
  onReset,
}: {
  optionId: string;
  textId: string;
  option: string;
  text: string;
  onOption: (value: string) => void;
  onText: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  return (
    <div className="clt-card">
      <div className="clt-card-header">
        <h2>
          <i className="fas fa-search" /> Search Client
        </h2>
      </div>
      <div className="clt-card-body">
        <div className="clt-search-form">
          <div className="clt-form-group">
            <label htmlFor={optionId}>Search Option</label>
            <MenuSelect
              id={optionId}
              skin="public"
              className="ui-select"
              value={option}
              options={[
                { value: "", label: "Select option" },
                { value: "name", label: "Client Name" },
                { value: "mobile", label: "Mobile No." },
                { value: "age", label: "Age" },
              ]}
              onChange={(event) => onOption(event.target.value)}
            />
          </div>
          <div className="clt-form-group">
            <label htmlFor={textId}>Search Text</label>
            <input
              id={textId}
              type="text"
              className="clt-form-control"
              placeholder="Enter search text…"
              value={text}
              onChange={(event) => onText(event.target.value)}
            />
          </div>
          <div className="clt-btn-row">
            <button
              type="button"
              className="clt-btn clt-btn-primary"
              onClick={onSearch}
            >
              <i className="fas fa-search" /> Search
            </button>
            <button
              type="button"
              className="clt-btn clt-btn-secondary"
              onClick={onReset}
            >
              <i className="fas fa-undo-alt" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CltTableTools({
  perPage,
  onPerPage,
  query,
  onQuery,
  selectId,
}: {
  perPage: number;
  onPerPage: (value: number) => void;
  query: string;
  onQuery: (value: string) => void;
  selectId: string;
}) {
  return (
    <div className="clt-table-controls">
      <div className="clt-entries-wrap">
        <MenuSelect
          id={selectId}
          skin="public"
          className="ui-select clt-entries-menu"
          aria-label="Entries per page"
          value={String(perPage)}
          options={[10, 25, 50, 100].map((n) => ({
            value: String(n),
            label: String(n),
          }))}
          onChange={(event) => onPerPage(Number(event.target.value))}
        />
        <span>entries per page</span>
      </div>
      <div className="clt-search-box">
        <i className="fas fa-search" />
        <input
          type="text"
          placeholder="Search…"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </div>
    </div>
  );
}

type SortValue = string | number | null | undefined;
type SortState<K extends string> = { key: K; dir: "asc" | "desc" } | null;

/** Orders numbers numerically, dd/mm/yyyy and yyyy-mm-dd dates by day, and text case-insensitively. */
function sortKey(value: SortValue): number | string {
  if (value == null || value === "") return "";
  if (typeof value === "number") return value;
  const text = value.trim();
  if (text !== "" && Number.isFinite(Number(text))) return Number(text);
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (dmy) return Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const parsed = Date.parse(text);
  if (/\d{4}|\d{1,2}[ -][A-Za-z]{3}/.test(text) && Number.isFinite(parsed)) {
    return parsed;
  }
  return text.toLowerCase();
}

export function useSortedRows<T, K extends string>(
  rows: T[],
  accessors: Record<K, (row: T) => SortValue>,
) {
  const [sort, setSort] = useState<SortState<K>>(null);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const read = accessors[sort.key];
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = sortKey(read(a));
      const y = sortKey(read(b));
      if (x === y) return 0;
      if (x === "") return 1;
      if (y === "") return -1;
      if (typeof x === "number" && typeof y === "number") {
        return (x - y) * factor;
      }
      return String(x).localeCompare(String(y)) * factor;
    });
    // accessors are static per view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);
  const toggle = (key: K) =>
    setSort((current) =>
      current?.key === key ?
        { key, dir: current.dir === "asc" ? "desc" : "asc" }
      : { key, dir: "asc" },
    );
  return { sorted, sort, toggle };
}

export function CltSortTh<K extends string>({
  label,
  sortKey: key,
  sort,
  onSort,
}: {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (key: K) => void;
}) {
  const active = sort?.key === key ? sort.dir : null;
  return (
    <th
      className={
        active ? `clt-th-sortable clt-sort-${active}` : "clt-th-sortable"
      }
      aria-sort={
        active === "asc" ? "ascending"
        : active === "desc" ?
          "descending"
        : "none"
      }
      onClick={() => onSort(key)}
    >
      <span className="clt-th-sort">
        {label}{" "}
        <i
          className={
            active === "asc" ? "fas fa-sort-up"
            : active === "desc" ?
              "fas fa-sort-down"
            : "fas fa-sort"
          }
        />
      </span>
    </th>
  );
}

export function usePagedRows<T>(rows: T[], perPage: number) {
  const [page, setPage] = useState(1);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / Math.max(perPage, 1)));
  const safe = Math.min(page, pages);
  const start = total === 0 ? 0 : (safe - 1) * perPage;
  const slice = useMemo(
    () => rows.slice(start, start + perPage),
    [rows, start, perPage],
  );
  const end = start + slice.length;
  return { page: safe, setPage, total, pages, start, end, slice };
}

export function CltPager({
  page,
  pages,
  start,
  end,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  start: number;
  end: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, windowStart + 4);
  const nums: number[] = [];
  for (let n = windowStart; n <= windowEnd; n += 1) nums.push(n);

  return (
    <div className="clt-pagination-wrap">
      <div className="clt-page-info">
        {total === 0 ?
          "No entries found"
        : `Showing ${start + 1} to ${end} of ${total} entr${total === 1 ? "y" : "ies"}`
        }
      </div>
      {total > 0 ?
        <div className="clt-page-btns">
          <button
            type="button"
            className="clt-page-btn"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Prev
          </button>
          {nums.map((n) => (
            <button
              key={n}
              type="button"
              className={
                n === page ? "clt-page-btn clt-page-active" : "clt-page-btn"
              }
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="clt-page-btn"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            Next
          </button>
        </div>
      : null}
    </div>
  );
}
