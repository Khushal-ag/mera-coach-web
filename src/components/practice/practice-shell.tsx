"use client";

import { useEffect, useId, useState } from "react";
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

function pageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Overview";
  const hit = practiceNav.find((item) =>
    navActive(pathname, item.href, "exact" in item && item.exact),
  );
  return hit?.label ?? "Coaching";
}

const railLink =
  "mc-press group relative flex min-h-11 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 text-sm font-medium text-ink-muted transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[color:var(--mc-secondary-light)] hover:text-mc-secondary focus-visible:ring-2 focus-visible:ring-mc-secondary focus-visible:outline-none active:scale-[0.98]";

const railLinkActive =
  "bg-[color:var(--mc-secondary-light)] font-semibold text-mc-secondary hover:bg-[color:var(--mc-secondary-light)] hover:text-mc-secondary";

export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-mc-secondary"
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
        className={cn(railLink, "w-full")}
      >
        <LogOut
          className="size-4 shrink-0 text-ink-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        Log out
      </button>
    </div>
  );

  const coachChip = (
    <div className="mb-3 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-3">
      <p className="truncate text-sm font-semibold text-ink">
        {session.fullName}
      </p>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <aside className="sticky top-0 hidden h-dvh w-[16rem] shrink-0 flex-col border-r border-line bg-surface px-3 py-5 text-ink lg:flex">
        <Link href="/dashboard" className="mb-6 px-2">
          <BrandLockup variant="workspace" />
        </Link>
        <p className="mb-2 px-3 text-xs font-semibold text-ink-muted">
          Coaching
        </p>
        {navLinks}
        <div className="mt-auto pt-4">
          {coachChip}
          <div className="border-t border-line pt-3">{utilityLinks}</div>
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
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col overflow-y-auto border-r border-line bg-surface px-3 py-5 text-ink shadow-[8px_0_32px_rgba(28,28,28,0.12)]"
          >
            <div className="mb-4 flex items-center justify-between gap-2 px-1">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <BrandLockup variant="workspace" />
              </Link>
              <button
                type="button"
                className="mc-press inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-paper text-ink"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <p className="mb-2 px-3 text-xs font-semibold text-ink-muted">
              Coaching
            </p>
            {navLinks}
            <div className="mt-auto pt-4">
              {coachChip}
              <div className="border-t border-line pt-3">{utilityLinks}</div>
            </div>
          </aside>
        </div>
      : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface text-ink">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
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
                <p className="font-display text-sm font-bold text-ink">
                  {pageTitle(pathname)}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {session.fullName}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="mc-btn-primary mc-press hidden min-h-11 px-4 text-sm md:inline-flex"
            >
              Site home
            </Link>
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
