"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { PostCounts } from "@/components/practice/dashboard-slides";
import type {
  ClientSummary,
  EnquiryLead,
  RecheckupDueClient,
} from "@/types/practice";

import { useAuth } from "@/components/auth-provider";
import { ListEmpty } from "@/components/list-empty";
import {
  buildDashboardSlides,
  countPosts,
} from "@/components/practice/dashboard-slides";
import { DashboardCarouselSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { DASHBOARD_CAROUSEL } from "@/constants/ui";
import { useOpenAddClient } from "@/hooks/use-open-add-client";
import {
  fetchAuthedCoachProfile,
  fetchClientList,
  fetchEnquiryLeads,
  fetchRecheckupList,
} from "@/lib/api/practice";
import { fetchMyPackages, fetchMyPosts } from "@/lib/api/showcase";
import { getProfileCompletion } from "@/lib/profile-completion";
import { describeValidity } from "@/lib/validity";

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

type ActivityItem = {
  key: string;
  text: string;
  name: string;
  tone: "green" | "blue" | "gold";
  at: number;
};

/** dd/mm/yyyy (API style) or anything Date can parse. */
function parseWhen(value?: string): number | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/.exec(text);
  if (dmy) return Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const parsed = Date.parse(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function ago(at: number) {
  const days = Math.floor((Date.now() - at) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return "1 month ago";
  return `${Math.floor(days / 30)} months ago`;
}

export function DashboardHomeView() {
  const { session } = useAuth();
  const { openAddClient } = useOpenAddClient();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [leads, setLeads] = useState<EnquiryLead[]>([]);
  const [due, setDue] = useState<RecheckupDueClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState<number | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [packageCount, setPackageCount] = useState<number | null>(null);
  const [postCounts, setPostCounts] = useState<PostCounts | null>(null);
  const [validUpto, setValidUpto] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);
  const [slidePaused, setSlidePaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        const result = getProfileCompletion(profile);
        setCompletion(result.percent);
        setMissing(result.missingLabels);
        setValidUpto(profile.validUpto ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

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
        fetchMyPackages(),
        fetchMyPosts(),
      ]).then((results) => {
        if (cancelled) return;
        const [c, l, d, pk, ps] = results;
        if (pk.status === "fulfilled") setPackageCount(pk.value.length);
        if (ps.status === "fulfilled") setPostCounts(countPosts(ps.value));
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

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    clients.forEach((client) => {
      const at = parseWhen(client.lastCheckupDate);
      if (at != null && client.name) {
        items.push({
          key: `c-${client.clientCode ?? client.name}`,
          text: "New Check-up",
          name: client.name,
          tone: "blue",
          at,
        });
      }
    });
    leads.forEach((lead) => {
      const at = parseWhen(lead.dateLabel);
      if (at != null && lead.clientName) {
        items.push({
          key: `l-${lead.id}`,
          text: "New lead received",
          name: lead.clientName,
          tone: "gold",
          at,
        });
      }
    });
    return items.sort((a, b) => b.at - a.at).slice(0, 7);
  }, [clients, leads]);

  const openLeads = useMemo(
    () => leads.filter((lead) => !lead.isContacted),
    [leads],
  );
  const profileHref =
    session?.coachCode ?
      `/coach/${encodeURIComponent(session.coachCode)}`
    : "/dashboard/profile";

  const validity = describeValidity(validUpto ?? session?.validUpto);
  const slides = useMemo(
    () =>
      buildDashboardSlides({
        ready: !loading,
        completion,
        missing,
        clientCount: clients.length,
        openLeadCount: openLeads.length,
        dueCount: due.length,
        packageCount,
        postCounts,
        validity,
        profileHref,
      }),
    [
      loading,
      completion,
      missing,
      clients.length,
      openLeads.length,
      due.length,
      packageCount,
      postCounts,
      validity,
      profileHref,
    ],
  );

  const active = slides.length ? slide % slides.length : 0;
  const slideCount = slides.length;
  useEffect(() => {
    if (slidePaused || slideCount < 2) return;
    const timer = window.setInterval(
      () => setSlide((current) => current + 1),
      DASHBOARD_CAROUSEL.intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [slidePaused, slideCount]);

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
        <AlertBanner tone="error">{error}</AlertBanner>
      : null}
      <div className="db-layout-grid">
        <div className="db-left-col">
          <div className="db-stats-grid">
            <div className="db-stat-card db-sc-green">
              <div className="db-sc-icon">
                <i className="fas fa-users" />
              </div>
              <div className="db-sc-body">
                <span className="db-sc-num">
                  {loading ? "…" : clients.length}
                </span>
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

          {loading || completion == null ?
            <DashboardCarouselSkeleton />
          : slides.length > 0 ?
            <div
              className="db-carousel-wrap"
              onMouseEnter={() => setSlidePaused(true)}
              onMouseLeave={() => setSlidePaused(false)}
            >
              <div className="db-carousel">
                <div
                  className="db-carousel-track"
                  style={{ transform: `translateX(-${active * 100}%)` }}
                >
                  {slides.map((item) => (
                    <div
                      key={item.id}
                      className={`db-slide db-slide-${item.tone}`}
                    >
                      <div className="db-slide-shapes">
                        <div className="db-sl-s db-sl-s1" />
                        <div className="db-sl-s db-sl-s2" />
                      </div>
                      <div className="db-slide-content">
                        <div className="db-slide-tag">
                          <i className={item.tag.icon} /> {item.tag.label}
                        </div>
                        <h2>
                          {item.title}
                          <br />
                          <em>{item.em}</em>
                        </h2>
                        <p>{item.text}</p>
                        {item.cta.href ?
                          <Link href={item.cta.href} className="db-slide-btn">
                            <i className={item.cta.icon} /> {item.cta.label}
                          </Link>
                        : <button
                            type="button"
                            className="db-slide-btn"
                            onClick={() => void openAddClient()}
                          >
                            <i className={item.cta.icon} /> {item.cta.label}
                          </button>
                        }
                      </div>
                      <div className="db-slide-visual">
                        {item.ring != null ?
                          <div className="db-profile-ring">
                            <svg viewBox="0 0 100 100" className="db-ring-svg">
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                className="db-ring-bg"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                className="db-ring-fill"
                                strokeDasharray={`${Math.round((item.ring / 100) * 264)} 264`}
                              />
                            </svg>
                            <span className="db-ring-pct">{item.ring}%</span>
                          </div>
                        : <div className="db-money-icon">
                            <i className={item.icon} />
                          </div>
                        }
                      </div>
                    </div>
                  ))}
                </div>
                {slides.length > 1 ?
                  <>
                    <button
                      type="button"
                      className="db-car-btn db-car-prev"
                      aria-label="Previous"
                      onClick={() => setSlide(active + slides.length - 1)}
                    >
                      <i className="fas fa-chevron-left" />
                    </button>
                    <button
                      type="button"
                      className="db-car-btn db-car-next"
                      aria-label="Next"
                      onClick={() => setSlide(active + 1)}
                    >
                      <i className="fas fa-chevron-right" />
                    </button>
                    <div className="db-car-dots">
                      {slides.map((item, dot) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={`Go to slide ${dot + 1}`}
                          className={
                            dot === active ?
                              "db-car-dot db-dot-active"
                            : "db-car-dot"
                          }
                          onClick={() => setSlide(dot)}
                        />
                      ))}
                    </div>
                  </>
                : null}
              </div>
            </div>
          : null}
        </div>

        <div className="db-activity-wrap">
          <div className="db-activity-card">
            <div className="db-ac-head">
              <h3>
                <i className="fas fa-history" /> Recent Activity
              </h3>
            </div>
            {loading ?
              <div className="db-ac-list" />
            : activity.length === 0 ?
              <ListEmpty
                title="No recent activity yet."
                icon="fas fa-history"
              />
            : <div className="db-ac-list">
                {activity.map((item, index) => (
                  <div key={item.key} className="db-ac-item">
                    <div className={`db-ac-dot db-dot-${item.tone}`} />
                    <div
                      className={
                        index === activity.length - 1 ?
                          "db-ac-line db-ac-line-last"
                        : "db-ac-line"
                      }
                    />
                    <div className="db-ac-body">
                      <span className="db-ac-text">
                        {item.text}: <strong>{item.name}</strong>
                      </span>
                      <span className="db-ac-time">{ago(item.at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
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
