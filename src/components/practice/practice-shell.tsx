"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { BrandLockup } from "@/components/brand-lockup";
import { practiceNav } from "@/config/practice";
import { cn } from "@/lib/utils";

const iconByHref: Record<string, React.ReactNode> = {
  "/dashboard": (
    <LayoutDashboard className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/clients": (
    <Users className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/checkups": (
    <ClipboardCheck className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/leads": (
    <Inbox className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/packages": (
    <Package className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/events": (
    <CalendarDays className="size-4" strokeWidth={1.75} aria-hidden />
  ),
  "/dashboard/profile": (
    <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
  ),
};

function navActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

const railLink =
  "group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 font-display text-[13.5px] font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-[color:var(--mc-accent)] focus-visible:outline-none";

const railLinkActive =
  "bg-[color:var(--mc-accent)]/18 font-bold text-[color:var(--mc-accent)] hover:bg-[color:var(--mc-accent)]/18 hover:text-[color:var(--mc-accent)]";

const menuLink =
  "flex min-h-11 items-center gap-2.5 px-4 text-[13.5px] text-ink hover:bg-[color:var(--paper-elevated)]";

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

  // RequireAuth only mounts this after session is resolved post-hydration.
  if (!session) return null;

  const renderNav = () => (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Coaching">
      {practiceNav.map((item) => {
        const active = navActive(
          pathname,
          item.href,
          "exact" in item && item.exact,
        );
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(railLink, active && railLinkActive)}
            aria-current={active ? "page" : undefined}
          >
            {active ?
              <span
                className="absolute top-1/2 left-0 h-[22px] w-[3px] -translate-y-1/2 rounded-r bg-[color:var(--mc-accent)]"
                aria-hidden
              />
            : null}
            <span
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center",
                active ? "text-[color:var(--mc-accent)]" : "text-white/60",
              )}
            >
              {iconByHref[item.href]}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const renderLogout = () => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        void logout();
      }}
      className={cn(
        railLink,
        "w-full text-[#ffb4b4] hover:bg-[#ff6464]/10 hover:text-[#ff8080]",
      )}
    >
      <LogOut
        className="size-4 shrink-0 text-[#ffb4b4]"
        strokeWidth={1.75}
        aria-hidden
      />
      Log out
    </button>
  );

  const mark = initials(session.fullName);

  const renderBrand = () => (
    <Link
      href="/dashboard"
      onClick={() => setOpen(false)}
      className="inline-flex rounded-xl focus-visible:ring-2 focus-visible:ring-[color:var(--mc-accent)] focus-visible:outline-none"
      aria-label="Mera Coach home"
    >
      <BrandLockup variant="nav" />
    </Link>
  );

  return (
    <div className="coach-app flex min-h-dvh bg-[#f5ede0] text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col bg-[image:linear-gradient(180deg,#0f1e14_0%,#1b4332_55%,#163528_100%)] text-white shadow-[8px_0_28px_rgba(27,67,50,0.16)] lg:flex">
        <div className="px-5 pt-[22px] pb-4">{renderBrand()}</div>
        <div className="mx-5 mb-2 h-px bg-white/10" />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-2">
          {renderNav()}
        </div>
        <div className="border-t border-white/8 px-3 py-3">
          {renderLogout()}
        </div>
      </aside>

      {open ?
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id={navId}
            role="dialog"
            aria-modal="true"
            aria-label="Coaching menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[252px] max-w-[calc(100vw-3rem)] flex-col overflow-y-auto bg-[image:linear-gradient(180deg,#0f1e14_0%,#1b4332_55%,#163528_100%)] text-white shadow-[8px_0_28px_rgba(27,67,50,0.16)]"
          >
            <div className="flex items-start justify-between gap-2 px-5 pt-[22px] pb-4">
              <div className="min-w-0">{renderBrand()}</div>
              <button
                type="button"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/8"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mx-5 mb-2 h-px bg-white/10" />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-2">
              {renderNav()}
            </div>
            <div className="border-t border-white/8 px-3 py-3">
              {renderLogout()}
            </div>
          </aside>
        </div>
      : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e5d5c5] bg-[#fdf8f2] px-4 text-ink sm:px-7">
          <button
            type="button"
            className="inline-flex size-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-lg lg:hidden"
            aria-expanded={open}
            aria-controls={navId}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="block h-0.5 w-[18px] rounded-full bg-ink" />
            <span className="block h-0.5 w-[18px] rounded-full bg-ink" />
            <span className="block h-0.5 w-[18px] rounded-full bg-ink" />
          </button>

          <div className="relative ml-auto" ref={accountMenuRef}>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-mc-secondary bg-white py-1 pr-3 pl-1 text-ink shadow-[0_1px_2px_rgba(44,24,16,0.04)] hover:bg-mc-secondary-light focus-visible:ring-2 focus-visible:ring-mc-secondary focus-visible:outline-none"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`Account menu for ${session.fullName}`}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="grid size-8 place-items-center rounded-full bg-[image:linear-gradient(135deg,#1b4332,#2d6a4f)] font-display text-xs font-extrabold text-white">
                {mark}
              </span>
              <span className="max-w-[7.5rem] truncate font-display text-[13px] font-semibold text-ink sm:max-w-[11rem] sm:text-sm">
                {session.fullName}
              </span>
              <ChevronDown
                className={cn(
                  "size-3 shrink-0 text-mc-secondary transition-transform duration-200",
                  menuOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {menuOpen ?
              <div
                role="menu"
                className="absolute right-0 z-40 mt-2.5 w-[230px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_32px_rgba(27,67,50,0.14)]"
              >
                <p className="border-b border-line px-4 py-3 text-[11.5px] text-ink-muted">
                  {session.email || "Coach account"}
                </p>
                <Link
                  href="/dashboard/profile"
                  role="menuitem"
                  className={menuLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound
                    className="size-3.5 text-mc-secondary"
                    aria-hidden
                  />
                  My profile
                </Link>
                <Link
                  href="/dashboard/profile/password"
                  role="menuitem"
                  className={menuLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <KeyRound
                    className="size-3.5 text-mc-secondary"
                    aria-hidden
                  />
                  Change password
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="flex min-h-11 w-full items-center gap-2.5 border-t border-line px-4 text-left text-[13.5px] font-semibold text-[color:var(--mc-primary)] hover:bg-[#fff0ee]"
                  onClick={() => {
                    setMenuOpen(false);
                    void logout();
                  }}
                >
                  <LogOut className="size-3.5" aria-hidden />
                  Log out
                </button>
              </div>
            : null}
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-clip bg-[#f5ede0] px-4 pt-6 pb-12 sm:px-7 sm:pt-8 sm:pb-16">
          <div
            key={pathname}
            className="mc-enter mx-auto w-full max-w-6xl min-w-0"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
