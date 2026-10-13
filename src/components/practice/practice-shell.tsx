"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
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
  "mc-press group relative flex min-h-11 items-center gap-2.5 rounded-xl px-3 font-display text-sm font-medium text-white/80 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[color:var(--mc-accent)] focus-visible:outline-none active:scale-[0.98]";

const railLinkActive =
  "bg-[color:var(--mc-accent)]/18 font-bold text-[color:var(--mc-accent)] hover:bg-[color:var(--mc-accent)]/18 hover:text-[color:var(--mc-accent)]";

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
                className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[color:var(--mc-accent)]"
                aria-hidden
              />
            : null}
            <span
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center",
                active ? "text-[color:var(--mc-accent)]" : "text-white/80",
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
          className="size-4 shrink-0 text-[color:var(--mc-accent)]"
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
          className="size-4 shrink-0 text-white/80"
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
          "w-full text-red-300/80 hover:bg-red-400/10 hover:text-red-200",
        )}
      >
        <LogOut
          className="size-4 shrink-0 text-red-300/80"
          strokeWidth={1.75}
          aria-hidden
        />
        Log out
      </button>
    </div>
  );

  const mark = initials(session.fullName);

  const identity = (
    <div className="mb-3 flex items-center gap-3 px-2">
      <span className="grid size-12 shrink-0 place-items-center rounded-[14px] border border-white/20 bg-white/12 font-display text-sm font-bold text-[color:var(--mc-accent)]">
        {mark}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-sm font-bold text-white">
          {session.fullName}
        </span>
        <span className="block truncate text-[11px] text-white/75">Coach</span>
      </span>
    </div>
  );

  const coachChip = (
    <div className="mb-3 flex items-center gap-2 rounded-[10px] border border-[color:var(--mc-accent)]/30 bg-[color:var(--mc-accent)]/15 px-3 py-2.5">
      <Crown
        className="size-4 shrink-0 text-[color:var(--mc-accent)]"
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block text-[10px] text-white/75">
          Coaching workspace
        </span>
        <span className="block truncate font-display text-xs font-bold text-[color:var(--mc-accent)]">
          {session.fullName}
        </span>
      </span>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper-elevated text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col bg-[image:linear-gradient(180deg,#0f1e14_0%,#1b4332_60%,#1a3828_100%)] px-3 py-5 text-white shadow-[4px_0_24px_rgba(0,0,0,0.2)] lg:flex">
        <Link href="/dashboard" className="mb-4 block px-1">
          <BrandLockup variant="nav" />
        </Link>
        {identity}
        <div className="mx-2 mb-3 h-px bg-white/10" />
        {navLinks}
        <div className="mt-auto pt-4">
          {coachChip}
          <div className="border-t border-white/10 pt-3">{utilityLinks}</div>
        </div>
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
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col overflow-y-auto bg-[image:linear-gradient(180deg,#0f1e14_0%,#1b4332_60%,#1a3828_100%)] px-3 py-5 text-white shadow-[8px_0_32px_rgba(15,32,24,0.35)]"
          >
            <div className="mb-4 flex items-center justify-between gap-2 px-1">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <BrandLockup variant="nav" />
              </Link>
              <button
                type="button"
                className="mc-press inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            {identity}
            <div className="mx-2 mb-3 h-px bg-white/10" />
            {navLinks}
            <div className="mt-auto pt-4">
              {coachChip}
              <div className="border-t border-white/10 pt-3">
                {utilityLinks}
              </div>
            </div>
          </aside>
        </div>
      : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white text-ink shadow-[0_2px_12px_rgba(27,67,50,0.1)]">
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
              <div className="min-w-0 lg:hidden">
                <BrandLockup
                  variant="workspace"
                  className="text-base sm:text-base"
                />
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm text-ink-muted">
                  Welcome back,{" "}
                  <strong className="font-display text-ink">
                    {session.fullName}
                  </strong>
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {pageTitle(pathname)}
                </p>
              </div>
            </div>
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper px-2 py-1 pr-3"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="grid size-8 place-items-center rounded-full bg-mc-secondary font-display text-[11px] font-bold text-white">
                  {mark}
                </span>
                <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">
                  {session.fullName}
                </span>
              </button>
              {menuOpen ?
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[0_16px_40px_rgba(44,24,16,0.12)]"
                >
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
