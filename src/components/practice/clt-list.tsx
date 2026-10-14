"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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
            <select
              id={optionId}
              className="clt-form-control"
              value={option}
              onChange={(event) => onOption(event.target.value)}
            >
              <option value="">— Select Option —</option>
              <option value="name">Client Name</option>
              <option value="mobile">Mobile No.</option>
              <option value="age">Age</option>
            </select>
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
        <select
          id={selectId}
          className="clt-entries-select"
          value={perPage}
          onChange={(event) => onPerPage(Number(event.target.value))}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
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
