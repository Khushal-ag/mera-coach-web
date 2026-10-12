"use client";

import { useId, useState } from "react";
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
  return hit?.label ?? "Practice";
}

export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navId = useId();

  if (!session) return null;

  const profileHref =
    session.coachCode ?
      `/coach/${encodeURIComponent(session.coachCode)}`
    : "/coach";

  const navLinks = (
    <nav className="flex flex-1 flex-col gap-0.5" aria-label="Coach practice">
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
            className={cn(
              "group relative flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition",
              active ?
                "bg-[color:var(--mc-secondary-light)] font-semibold text-[color:var(--mc-secondary-dark)]"
              : "text-ink-muted hover:bg-paper-elevated hover:text-ink",
            )}
            aria-current={active ? "page" : undefined}
          >
            {active ?
              <span
                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[color:var(--mc-secondary)]"
                aria-hidden
              />
            : null}
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-[8px]",
                active ?
                  "bg-white/70 text-[color:var(--mc-secondary)]"
                : "text-ink-muted",
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
        className="flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-ink-muted transition hover:bg-paper-elevated hover:text-ink"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-[8px] text-[color:var(--mc-brand-coach)]">
          <Crown className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        Premium
      </Link>
      <Link
        href={profileHref}
        onClick={() => setOpen(false)}
        className="flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-ink-muted transition hover:bg-paper-elevated hover:text-ink"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-[8px]">
          <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        Public profile
      </Link>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          void logout();
        }}
        className="flex min-h-10 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-ink-muted transition hover:bg-paper-elevated hover:text-ink"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-[8px]">
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
        Log out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      {/* Desktop: refined light rail - web product, not app frame */}
      <aside className="sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
        <Link href="/dashboard" className="mb-6 px-2">
          <BrandLockup variant="workspace" />
        </Link>
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
          Practice
        </p>
        {navLinks}
        <div className="mt-auto border-t border-line pt-3">{utilityLinks}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center rounded-[10px] border border-line bg-surface text-ink lg:hidden"
                aria-expanded={open}
                aria-controls={navId}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                {open ?
                  <X className="size-5" />
                : <Menu className="size-5" />}
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
                  {session.coachCode ? `, ${session.coachCode}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block lg:hidden">
                <p className="truncate font-display text-sm font-bold text-ink">
                  {session.fullName}
                </p>
                {session.coachCode ?
                  <p className="truncate text-xs text-ink-muted">
                    {session.coachCode}
                  </p>
                : null}
              </div>
              <Link
                href="/"
                className="hidden text-sm font-semibold text-mc-secondary hover:underline md:inline"
              >
                Site home
              </Link>
            </div>
          </div>

          {open ?
            <div
              id={navId}
              className="border-t border-line bg-surface px-3 py-4 lg:hidden"
            >
              {navLinks}
              <div className="mt-4 border-t border-line pt-3">
                {utilityLinks}
              </div>
            </div>
          : null}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
