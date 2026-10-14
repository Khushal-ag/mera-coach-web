"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type {
  ClientSummary,
  EnquiryLead,
  RecheckupDueClient,
} from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import {
  fetchClientList,
  fetchEnquiryLeads,
  fetchRecheckupList,
} from "@/lib/api/practice";

function todayLabel() {
  const d = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function DashboardHomeView() {
  const { session } = useAuth();
  const { openAddClient } = useOpenAddClient();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
  const [due, setDue] = useState<RecheckupDueClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.coachCode) return;
    let cancelled = false;
    const coachCode = session.coachCode;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void Promise.allSettled([
        fetchClientList({ coachCode }),
        fetchEnquiryLeads(coachCode),
        fetchRecheckupList({ coachCode }),
      ]).then((results) => {
        if (cancelled) return;
        const [c, l, d] = results;
        if (c.status === "fulfilled") setClients(c.value);
        if (l.status === "fulfilled") setLeads(l.value);
        if (d.status === "fulfilled") setDue(d.value);
        const metricFailures = [c, l, d].filter((r) => r.status === "rejected");
        if (metricFailures.length === 3) {
          setError("Could not load dashboard metrics. Try refreshing.");
        }
        setLoading(false);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [session?.coachCode]);

  const openLeads = useMemo(
    () => leads.filter((lead) => !lead.isContacted),
    [leads],
  );
  const profileHref =
    session?.coachCode ?
      `/coach/${encodeURIComponent(session.coachCode)}`
    : "/dashboard/profile";

  return (
    <div>
      <div className="db-page-head">
        <div>
          <h1 className="db-page-title">Dashboard</h1>
          <nav className="db-breadcrumb">
            <Link href="/dashboard">Home</Link>
            <i className="fas fa-chevron-right" />
            <span>Dashboard</span>
          </nav>
        </div>
        <div className="db-head-date">
          <i className="fas fa-calendar-alt" />
          <span>{todayLabel()}</span>
        </div>
      </div>
      {error ?
        <p className="rg-alert">{error}</p>
      : null}
      <div className="db-stats-grid">
        <div className="db-stat-card db-sc-green">
          <div className="db-sc-icon">
            <i className="fas fa-users" />
          </div>
          <div className="db-sc-body">
            <span className="db-sc-num">{loading ? "…" : clients.length}</span>
            <span className="db-sc-label">Total Clients</span>
            <span className="db-sc-sub">Total till date</span>
          </div>
        </div>
        <div className="db-stat-card db-sc-gold">
          <div className="db-sc-icon">
            <i className="fas fa-filter" />
          </div>
          <div className="db-sc-body">
            <span className="db-sc-num">
              {loading ? "…" : openLeads.length}
            </span>
            <span className="db-sc-label">Active Leads</span>
            <span className="db-sc-sub">Total till date</span>
          </div>
        </div>
        <div className="db-stat-card db-sc-blue">
          <div className="db-sc-icon">
            <i className="fas fa-clipboard-check" />
          </div>
          <div className="db-sc-body">
            <span className="db-sc-num">{loading ? "…" : due.length}</span>
            <span className="db-sc-label">Check-ups Due</span>
            <span className="db-sc-sub">Due for re-checkup</span>
          </div>
        </div>
      </div>
      <div className="db-quick-actions">
        <h2 className="db-qa-title">Quick Actions</h2>
        <div className="db-qa-grid">
          <button
            type="button"
            className="db-qa-card db-qa-green"
            onClick={() => void openAddClient()}
          >
            <div className="db-qa-icon">
              <i className="fas fa-user-plus" />
            </div>
            <strong>Add New Client</strong>
            <span>Create a new client profile</span>
          </button>
          <Link href="/dashboard/checkups" className="db-qa-card db-qa-gold">
            <div className="db-qa-icon">
              <i className="fas fa-clipboard-list" />
            </div>
            <strong>Record Check-up</strong>
            <span>Log a new health assessment</span>
          </Link>
          <Link href="/dashboard/clients" className="db-qa-card db-qa-blue">
            <div className="db-qa-icon">
              <i className="fas fa-chart-line" />
            </div>
            <strong>View Reports</strong>
            <span>Client progress &amp; analytics</span>
          </Link>
          <Link href={profileHref} className="db-qa-card db-qa-red">
            <div className="db-qa-icon">
              <i className="fas fa-share-alt" />
            </div>
            <strong>Share Profile</strong>
            <span>Share your coach profile link</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
