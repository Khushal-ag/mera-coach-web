"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";
import { isSubscriptionRequired } from "@/config/practice";
import { siteConfig } from "@/config/site";
import { premiumHref } from "@/lib/premium-link";

const headerListeners = new Set<() => void>();
let headerHydrated = false;

function subscribeHeaderHydration(listener: () => void) {
  headerListeners.add(listener);
  if (!headerHydrated) {
    queueMicrotask(() => {
      if (headerHydrated) return;
      headerHydrated = true;
      headerListeners.forEach((notify) => notify());
    });
  }
  return () => {
    headerListeners.delete(listener);
  };
}

function useHeaderHydrated() {
  return useSyncExternalStore(
    subscribeHeaderHydration,
    () => headerHydrated,
    () => false,
  );
}

function isNavActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavAnchor({
  href,
  className,
  children,
  onClick,
  "aria-current": ariaCurrent,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page";
}) {
  if (href === "#") {
    return (
      <a href="#" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      aria-current={ariaCurrent}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { session, ready, logout } = useAuth();
  const hydrated = useHeaderHydrated();
  const [open, setOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState(pathname);

  if (openForPath !== pathname) {
    setOpenForPath(pathname);
    if (open) setOpen(false);
  }

  const signedIn = hydrated && ready && !!session;
  // Plans are only offered when the subscription limit is on, or to a coach who already has one.
  const showPremium = isSubscriptionRequired() || !!session?.premiumPaid;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="mc-public">
      <nav className="navbar" id="navbar">
        <div className="container">
          <Link href="/" className="nav-logo" onClick={close}>
            <div className="nav-logo-icon">
              <Image
                src={siteConfig.brand.logoMark}
                alt=""
                width={42}
                height={42}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div className="nav-logo-text">
              <span>Mera Coach</span>
              <span>Wellness Platform</span>
            </div>
          </Link>
          <div className="nav-links">
            {siteConfig.nav.map((item) => (
              <NavAnchor
                key={item.label}
                href={item.href}
                className={
                  isNavActive(pathname, item.href) ? "active" : undefined
                }
                aria-current={
                  isNavActive(pathname, item.href) ? "page" : undefined
                }
              >
                {item.label}
              </NavAnchor>
            ))}
          </div>
          <div className="nav-actions">
            {signedIn && session ?
              <>
                {showPremium ?
                  <Link href={premiumHref(session)} className="nav-premium">
                    <i className="fas fa-crown" aria-hidden /> Premium
                  </Link>
                : null}
                <Link href="/dashboard" className="btn btn-primary">
                  <i className="fas fa-th-large" aria-hidden /> Dashboard
                </Link>
                <button
                  type="button"
                  className="nav-logout"
                  aria-label="Log out"
                  title="Log out"
                  onClick={() => {
                    close();
                    void logout();
                  }}
                >
                  <i className="fas fa-sign-out-alt" aria-hidden />
                </button>
              </>
            : <>
                <Link href="/coach-login" className="btn btn-outline">
                  Login
                </Link>
                <Link href="/register" className="btn btn-primary">
                  <i className="fas fa-user-plus" /> Join Free
                </Link>
              </>
            }
          </div>
          <button
            type="button"
            className="hamburger"
            id="hamburger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={open ? "overlay show" : "overlay"}
        id="overlay"
        onClick={close}
      />

      <div className={open ? "mobile-nav open" : "mobile-nav"} id="mobileNav">
        <button
          type="button"
          className="mobile-close"
          onClick={close}
          aria-label="Close menu"
        >
          <i className="fas fa-times" />
        </button>
        {siteConfig.nav.map((item) => (
          <NavAnchor
            key={`m-${item.label}`}
            href={item.href}
            className={isNavActive(pathname, item.href) ? "active" : undefined}
            aria-current={isNavActive(pathname, item.href) ? "page" : undefined}
            onClick={close}
          >
            {item.label}
          </NavAnchor>
        ))}
        {signedIn && session ?
          <div className="mobile-actions">
            {showPremium ?
              <Link
                href={premiumHref(session)}
                className="nav-premium"
                onClick={close}
              >
                <i className="fas fa-crown" aria-hidden /> Premium
              </Link>
            : null}
            <Link href="/dashboard" className="btn btn-primary" onClick={close}>
              <i className="fas fa-th-large" aria-hidden /> Dashboard
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                close();
                void logout();
              }}
            >
              <i className="fas fa-sign-out-alt" aria-hidden /> Logout
            </button>
          </div>
        : <div className="mobile-actions">
            <Link
              href="/coach-login"
              className="btn btn-outline"
              onClick={close}
            >
              Login
            </Link>
            <Link href="/register" className="btn btn-primary" onClick={close}>
              <i className="fas fa-user-plus" aria-hidden /> Join Free
            </Link>
            <Link
              href="/register"
              className="btn btn-secondary"
              onClick={close}
            >
              Become a Coach
            </Link>
          </div>
        }
      </div>
    </header>
  );
}
