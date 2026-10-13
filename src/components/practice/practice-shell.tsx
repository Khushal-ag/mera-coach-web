"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Crown,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
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

function premiumHref(session: { coachId: number; coachCode: string }) {
  const qs = new URLSearchParams();
  if (session.coachId > 0) qs.set("coachId", String(session.coachId));
  if (session.coachCode) qs.set("coachCode", session.coachCode);
  return qs.toString() ? `/premium?${qs.toString()}` : "/premium";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function pageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Overview";
  const hit = practiceNav.find((item) =>
    navActive(pathname, item.href, "exact" in item && item.exact),
  );
  return hit?.label ?? "Coaching";
}

const railLink =
  "mc-press group relative flex min-h-11 items-center gap-2.5 rounded-xl px-3 font-display text-sm font-medium text-ink-muted transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-mc-secondary-light hover:text-mc-secondary focus-visible:ring-2 focus-visible:ring-mc-secondary focus-visible:outline-none active:scale-[0.98]";

const railLinkActive =
  "bg-mc-secondary-light font-bold text-mc-secondary hover:bg-mc-secondary-light hover:text-mc-secondary";

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

  const profileHref =
    session.coachCode ?
      `/coach/${encodeURIComponent(session.coachCode)}`
    : "/coach";

  const navLinks = (
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
                className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-mc-secondary"
                aria-hidden
              />
            : null}
            <span
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center",
                active ? "text-mc-secondary" : "text-ink-muted",
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

  const utilityLinks = (
    <div className="space-y-0.5">
      <Link
        href={premiumHref(session)}
        onClick={() => setOpen(false)}
        className={railLink}
      >
        <Crown
          className="size-4 shrink-0 text-mc-accent"
          strokeWidth={1.75}
          aria-hidden
        />
        Premium
      </Link>
      <Link
        href={profileHref}
        onClick={() => setOpen(false)}
        className={railLink}
      >
        <ExternalLink
          className="size-4 shrink-0 text-ink-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        Public profile
      </Link>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          void logout();
        }}
        className={cn(
          railLink,
          "w-full text-[color:var(--mc-destructive)] hover:bg-[color:var(--mc-destructive-soft)] hover:text-[color:var(--mc-destructive)]",
        )}
      >
        <LogOut
          className="size-4 shrink-0 text-[color:var(--mc-destructive)]"
          strokeWidth={1.75}
          aria-hidden
        />
        Log out
      </button>
    </div>
  );

  const mark = initials(session.fullName);
  const title = pageTitle(pathname);

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-white px-3 py-5 text-ink shadow-[4px_0_24px_rgba(23,134,118,0.08)] lg:flex">
        <Link href="/dashboard" className="mb-4 block px-1">
          <BrandLockup variant="workspace" />
        </Link>
        <div className="mx-2 mb-3 h-px bg-line" />
        {navLinks}
        <div className="mt-auto border-t border-line pt-3">{utilityLinks}</div>
      </aside>

      {open ?
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[color:var(--ink)]/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id={navId}
            role="dialog"
            aria-modal="true"
            aria-label="Coaching menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col overflow-y-auto border-r border-line bg-white px-3 py-5 text-ink shadow-[8px_0_32px_rgba(23,134,118,0.16)]"
          >
            <div className="mb-4 flex items-center justify-between gap-2 px-1">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <BrandLockup variant="workspace" />
              </Link>
              <button
                type="button"
                className="mc-press inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-ink"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mx-2 mb-3 h-px bg-line" />
            {navLinks}
            <div className="mt-auto border-t border-line pt-3">
              {utilityLinks}
            </div>
          </aside>
        </div>
      : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white text-ink shadow-[0_2px_12px_rgba(23,134,118,0.1)]">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="mc-press inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-paper text-ink transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] lg:hidden"
                aria-expanded={open}
                aria-controls={navId}
                aria-label="Open menu"
                onClick={() => setOpen(true)}
              >
                <Menu className="size-5" aria-hidden />
              </button>
              {pathname === "/dashboard" ?
                <h1 className="truncate font-display text-lg font-bold tracking-tight text-ink">
                  {title}
                </h1>
              : <p className="truncate font-display text-lg font-bold tracking-tight text-ink">
                  {title}
                </p>
              }
            </div>
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper py-1 pr-2 pl-1.5 focus-visible:ring-2 focus-visible:ring-mc-secondary focus-visible:outline-none sm:pr-3"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`Account menu for ${session.fullName}`}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="bg-mc-secondary-dark grid size-8 place-items-center rounded-full font-display text-[11px] font-bold text-white">
                  {mark}
                </span>
                <span className="hidden max-w-[11rem] truncate font-display text-sm font-semibold text-ink sm:block">
                  {session.fullName}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-ink-muted transition-transform duration-200",
                    menuOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {menuOpen ?
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_16px_40px_rgba(23,134,118,0.12)]"
                >
                  <p className="px-4 pt-2 font-display text-sm font-bold text-ink sm:sr-only">
                    {session.fullName}
                  </p>
                  <p className="px-4 py-2 text-xs text-ink-muted">
                    {session.email || "Coach account"}
                  </p>
                  <Link
                    href="/dashboard/profile"
                    role="menuitem"
                    className="flex min-h-11 items-center px-4 text-sm font-semibold text-ink hover:bg-paper"
                    onClick={() => setMenuOpen(false)}
                  >
                    My profile
                  </Link>
                  <Link
                    href={profileHref}
                    role="menuitem"
                    className="flex min-h-11 items-center px-4 text-sm font-semibold text-ink hover:bg-paper"
                    onClick={() => setMenuOpen(false)}
                  >
                    Public page
                  </Link>
                  <Link
                    href={premiumHref(session)}
                    role="menuitem"
                    className="flex min-h-11 items-center px-4 text-sm font-semibold text-ink hover:bg-paper"
                    onClick={() => setMenuOpen(false)}
                  >
                    Premium
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex min-h-11 w-full items-center px-4 text-left text-sm font-semibold text-[color:var(--mc-destructive)] hover:bg-paper"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                  >
                    Log out
                  </button>
                </div>
              : null}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div key={pathname} className="mc-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
