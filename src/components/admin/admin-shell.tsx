"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { useAdminSession } from "@/hooks/use-admin-session";

const navItems = [
  {
    href: siteConfig.links.adminCoaches,
    label: "Coaches",
    icon: "fas fa-chart-bar",
    match: "coaches",
  },
  {
    href: siteConfig.links.adminAds,
    label: "Creatives",
    icon: "fas fa-thumbs-up",
    match: "ads",
  },
] as const;

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAdminSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const navId = useId();
  // Page titles live in PracticePageHeader — keep the top bar to section context only.
  const sectionLabel =
    pathname.startsWith(siteConfig.links.adminAds) ? "Creatives"
    : pathname.startsWith(siteConfig.links.adminCoaches) ? "Coaches"
    : "Console";

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

  if (!session) return null;

  function signOut() {
    logout();
    router.replace(siteConfig.links.admin);
  }

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
          aria-label="Admin navigation"
        >
          <div className="cl-brand">
            <div className="cl-brand-logo">
              <Image
                src={siteConfig.brand.logoMark}
                alt=""
                width={48}
                height={48}
              />
            </div>
            <div className="cl-brand-info">
              <span className="cl-brand-name">Mera Coach</span>
              <span className="cl-brand-cat">Admin console</span>
            </div>
          </div>
          <div className="cl-sidebar-divider" />
          <nav className="cl-nav" aria-label="Admin">
            {navItems.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active ? "cl-nav-link cl-nav-active" : "cl-nav-link"
                  }
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
          <div className="cl-sidebar-footer">
            <button
              type="button"
              className="cl-nav-link cl-logout"
              onClick={signOut}
            >
              <span className="cl-nav-icon">
                <i className="fas fa-sign-out-alt" />
              </span>
              <span className="cl-nav-label">Sign out</span>
            </button>
          </div>
        </aside>
        <div className="cl-main">
          <header className="cl-header">
            <button
              type="button"
              className="cl-hamburger"
              aria-label="Toggle navigation"
              aria-expanded={open}
              aria-controls={navId}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="cl-header-welcome">
              <span>Admin</span>
              <strong>{sectionLabel}</strong>
            </div>
            <div className="cl-header-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cl-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--cl-text)]">
                <i
                  className="fas fa-user-shield text-[var(--cl-gold)]"
                  aria-hidden
                />
                <span className="max-w-[160px] truncate sm:max-w-[220px]">
                  {session.fullName || session.email || "Admin"}
                </span>
              </span>
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
