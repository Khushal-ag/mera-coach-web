"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { isSubscriptionRequired } from "@/config/practice";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { fetchAuthedCoachProfile } from "@/lib/api/practice";
import { ensurePremiumStatus } from "@/lib/auth/premium-status";
import { initials } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { premiumHref } from "@/lib/premium-link";
import { cn } from "@/lib/utils";
import { describeValidity } from "@/lib/validity";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "fas fa-th-large",
    exact: true,
  },
  { href: "/dashboard/clients", label: "Clients", icon: "fas fa-users" },
  { href: "/dashboard/checkups", label: "Re-checkup", icon: "fas fa-redo-alt" },
  { href: "/dashboard/leads", label: "Leads", icon: "fas fa-filter" },
  { href: "/dashboard/packages", label: "Packages", icon: "fas fa-box" },
  { href: "/dashboard/events", label: "Events", icon: "fas fa-calendar-alt" },
  { href: "/dashboard/profile", label: "My Profile", icon: "fas fa-id-card" },
] as const;

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  const coveredByLongerItem = navItems.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
  return !coveredByLongerItem;
}

/**
 * Profile picture, or the coach's initials when there is no photo or it fails to load.
 */
function ShellPhoto({
  src,
  mark,
  initialsClass,
  style,
}: {
  src: string;
  mark: string;
  initialsClass?: string;
  style?: React.CSSProperties;
}) {
  const [bad, setBad] = useState(false);
  const [tracked, setTracked] = useState(src);
  if (src !== tracked) {
    setTracked(src);
    setBad(false);
  }
  const usable = (img: HTMLImageElement) =>
    img.naturalWidth > 0 && img.naturalHeight > 0;
  if (!src || bad) return <span className={initialsClass}>{mark}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      style={style}
      ref={(node) => {
        if (node?.complete && !usable(node)) setBad(true);
      }}
      onLoad={(event) => {
        if (!usable(event.currentTarget)) setBad(true);
      }}
      onError={() => setBad(true)}
    />
  );
}

export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [freshValidUpto, setFreshValidUpto] = useState<string | null>(null);
  const [paid, setPaid] = useState<boolean | undefined>(undefined);
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const navId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", closeOnDesktop);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Free plan or paid: decides whether the sidebar offers an upgrade.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void ensurePremiumStatus()
      .then((value) => {
        if (!cancelled) setPaid(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session]);

  // Login only carries the date from sign-in time. Read the saved one so a renewal shows at once.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void fetchAuthedCoachProfile()
      .then((profile) => {
        if (!cancelled) setFreshValidUpto(profile?.validUpto ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) return null;

  const mark = initials(session.fullName, { fallback: "C" });
  const name = session.fullName || "Coach";
  const photo = resolveMediaUrl(session.profileUrl);
  const validityInfo = describeValidity(freshValidUpto ?? session.validUpto);
  const validity =
    validityInfo?.dateLabel ||
    session.validUpto ||
    (session.premiumPaid ? "Active" : "");
  const validityTone = validityInfo?.tone ?? "ok";
  const needsRenewal =
    validityTone !== "ok" && isSubscriptionRequired() && !!validityInfo;

  const onFreePlan = (paid ?? session.premiumPaid) === false;
  const premiumLink = premiumHref(session);

  const nav = (
    <nav className="cl-nav" aria-label="Coaching">
      {navItems.map((item) => {
        const active = navActive(
          pathname,
          item.href,
          "exact" in item && item.exact,
        );
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "cl-nav-link cl-nav-active" : "cl-nav-link"}
            title={collapsed ? item.label : undefined}
            onClick={() => setOpen(false)}
          >
            <span className="cl-nav-icon">
              <i className={item.icon} />
            </span>
            <span className="cl-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("mc-dash", collapsed && "cl-collapsed")}>
      <div className="cl-body">
        <a href="#main-content" className="mc-skip">
          Skip to main content
        </a>
        <div
          className={open ? "cl-overlay cl-ov-show" : "cl-overlay"}
          onClick={() => setOpen(false)}
        />
        <aside
          className={open ? "cl-sidebar cl-sb-open" : "cl-sidebar"}
          id={navId}
        >
          <button
            type="button"
            className="cl-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i
              className={
                collapsed ? "fas fa-chevron-right" : "fas fa-chevron-left"
              }
              aria-hidden
            />
          </button>
          <Link
            href="/dashboard/profile"
            className="cl-brand"
            aria-label="Open my profile"
            title={collapsed ? "My Profile" : undefined}
            onClick={() => setOpen(false)}
          >
            <div className="cl-brand-logo">
              <ShellPhoto
                src={photo}
                mark={mark}
                initialsClass="cl-brand-initials"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="cl-brand-info">
              <span className="cl-brand-name">{name}</span>
              <span className="cl-brand-cat">{session.email || ""}</span>
            </div>
          </Link>
          <div className="cl-sidebar-divider" />
          {nav}
          <div className="cl-sidebar-footer">
            {validity ?
              <div className={`cl-validity-strip cl-validity-${validityTone}`}>
                <i className="fas fa-shield-alt" />
                <div>
                  <span>
                    {validityTone === "expired" ?
                      "Validity expired on"
                    : validityInfo || session.validUpto ?
                      onFreePlan ?
                        "Free plan valid till"
                      : "Subscription valid till"
                    : "Subscription"}
                  </span>
                  <strong>{validity}</strong>
                  {needsRenewal ?
                    <Link href="/premium" className="cl-validity-renew">
                      Renew now
                    </Link>
                  : null}
                </div>
              </div>
            : null}
            {onFreePlan ?
              <Link
                href={premiumLink}
                className="cl-upgrade"
                title={collapsed ? "Go Premium" : undefined}
                onClick={() => setOpen(false)}
              >
                <i className="fas fa-crown" aria-hidden />
                <span>
                  <strong>Go Premium</strong>
                  <small>Unlimited clients and more</small>
                </span>
                <i className="fas fa-chevron-right" aria-hidden />
              </Link>
            : null}
            <button
              type="button"
              className="cl-nav-link cl-logout"
              title={collapsed ? "Logout" : undefined}
              onClick={() => void logout()}
            >
              <span className="cl-nav-icon">
                <i className="fas fa-sign-out-alt" />
              </span>
              <span className="cl-nav-label">Logout</span>
            </button>
          </div>
        </aside>
        <div className="cl-main">
          <header className="cl-header">
            <button
              type="button"
              className="cl-hamburger"
              aria-label="Toggle navigation"
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="cl-header-welcome">
              <span>Welcome back,</span>
              <strong>{name}</strong>
            </div>
            <div className="cl-header-right">
              {validity ?
                <div
                  className={`cl-validity-badge cl-validity-${validityTone}`}
                >
                  <i className="fas fa-calendar-check" />
                  <span>
                    {validityTone === "expired" ?
                      "Expired"
                    : validityInfo || session.validUpto ?
                      "Validity"
                    : "Plan"}
                    : <strong>{validity}</strong>
                  </span>
                  {needsRenewal ?
                    <Link href="/premium" className="cl-validity-renew">
                      Renew
                    </Link>
                  : null}
                </div>
              : null}
              <button
                type="button"
                className="cl-notif-btn"
                title="Notifications"
                aria-label="Notifications"
              >
                <i className="fas fa-bell" />
                <span className="cl-notif-dot" />
              </button>
              <Link
                href="/"
                className="cl-home-btn"
                aria-label="Go to homepage"
                title="Homepage"
              >
                <i className="fas fa-home" aria-hidden />
              </Link>
            </div>
          </header>
          <main id="main-content" className="cl-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
