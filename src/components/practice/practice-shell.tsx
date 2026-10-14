"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { resolveMediaUrl } from "@/lib/media/media-url";

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navId = useId();
  const accountMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (accountMenuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  if (!session) return null;

  const mark = initials(session.fullName);
  const name = session.fullName || "Coach";
  const photo = resolveMediaUrl(session.profileUrl);
  const validity = session.validUpto || (session.premiumPaid ? "Active" : "");

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
    <div className="mc-dash">
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
          <div className="cl-brand">
            <div className="cl-brand-logo">
              {photo ?
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              : <span className="cl-brand-initials">{mark}</span>}
            </div>
            <div className="cl-brand-info">
              <span className="cl-brand-name">{name}</span>
              <span className="cl-brand-cat">{session.email || ""}</span>
            </div>
          </div>
          <div className="cl-sidebar-divider" />
          {nav}
          <div className="cl-sidebar-footer">
            {validity ?
              <div className="cl-validity-strip">
                <i className="fas fa-shield-alt" />
                <div>
                  <span>
                    {session.validUpto ?
                      "Subscription valid till"
                    : "Subscription"}
                  </span>
                  <strong>{validity}</strong>
                </div>
              </div>
            : null}
            <button
              type="button"
              className="cl-nav-link cl-logout"
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
                <div className="cl-validity-badge">
                  <i className="fas fa-calendar-check" />
                  <span>
                    {session.validUpto ? "Validity" : "Plan"}:{" "}
                    <strong>{validity}</strong>
                  </span>
                </div>
              : null}
              <div className="cl-profile-wrap" ref={accountMenuRef}>
                <button
                  type="button"
                  className="cl-profile-btn"
                  aria-label={`Account menu for ${name}`}
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <div className="cl-profile-avatar">
                    {photo ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="" />
                    : <span>{mark}</span>}
                  </div>
                  <i className="fas fa-chevron-down cl-profile-chevron" />
                </button>
                <div
                  className={
                    menuOpen ? "cl-profile-menu cl-pm-open" : "cl-profile-menu"
                  }
                >
                  <div className="cl-pm-top">
                    <div className="cl-pm-avatar">
                      {photo ?
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="" />
                      : <span>{mark}</span>}
                    </div>
                    <div className="cl-pm-info">
                      <strong>{name}</strong>
                      <span>{session.email || ""}</span>
                    </div>
                  </div>
                  <div className="cl-pm-sep" />
                  <Link
                    href="/dashboard/profile"
                    className="cl-pm-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fas fa-id-card" /> My Profile
                  </Link>
                  <Link
                    href="/dashboard/profile/password"
                    className="cl-pm-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <i className="fas fa-key" /> Change Password
                  </Link>
                  <div className="cl-pm-sep" />
                  <button
                    type="button"
                    className="cl-pm-link cl-pm-logout"
                    onClick={() => void logout()}
                  >
                    <i className="fas fa-sign-out-alt" /> Logout
                  </button>
                </div>
              </div>
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
