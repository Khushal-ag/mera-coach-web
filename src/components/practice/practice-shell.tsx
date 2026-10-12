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
  return hit?.label ?? "Coaching";
}

const railLink =
  "mc-press group relative flex min-h-10 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 text-sm font-medium text-white/80 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none active:scale-[0.98]";

const railLinkActive =
  "bg-white/14 font-semibold text-white hover:bg-white/16 hover:text-white";

export function PracticeShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navId = useId();

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
                className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[color:var(--mc-brand-coach)]"
                aria-hidden
              />
            : null}
            <span
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center",
                active ? "text-white" : "text-white/70",
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
          className="size-4 shrink-0 text-[color:var(--mc-brand-coach)]"
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
          className="size-4 shrink-0 text-white/70"
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
          className="size-4 shrink-0 text-white/70"
          strokeWidth={1.75}
          aria-hidden
        />
        Log out
      </button>
    </div>
  );

  const coachChip = (
    <div className="mb-3 rounded-[var(--radius-sm)] bg-black/20 px-3 py-3 ring-1 ring-white/12">
      <p className="truncate text-sm font-semibold text-white">
        {session.fullName}
      </p>
      {session.coachCode ?
        <p className="mt-0.5 truncate text-xs text-white/70">
          {session.coachCode}
        </p>
      : null}
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <aside className="mc-gradient-header sticky top-0 hidden h-dvh w-[16rem] shrink-0 flex-col px-3 py-5 text-white lg:flex">
        <Link href="/dashboard" className="mb-6 px-2">
          <BrandLockup variant="nav" />
        </Link>
        <p className="mb-2 px-3 text-xs font-semibold text-white/60">
          Coaching
        </p>
        {navLinks}
        <div className="mt-auto pt-4">
          {coachChip}
          <div className="border-t border-white/15 pt-3">{utilityLinks}</div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mc-gradient-header sticky top-0 z-40 text-white shadow-[0_8px_24px_color-mix(in_oklab,var(--mc-header-bottom)_28%,transparent)]">
          <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="mc-press inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-white/10 text-white transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] lg:hidden"
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
                <BrandLockup variant="nav" className="text-base sm:text-base" />
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="font-display text-sm font-bold text-white">
                  {pageTitle(pathname)}
                </p>
                <p className="truncate text-xs text-white/70">
                  {session.fullName}
                  {session.coachCode ? `, ${session.coachCode}` : ""}
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="mc-press hidden min-h-9 items-center rounded-full bg-[color:var(--mc-brand-coach)] px-4 text-sm font-bold text-ink transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] md:inline-flex"
            >
              Site home
            </Link>
          </div>

          {open ?
            <div
              id={navId}
              className="border-t border-white/15 bg-[color:var(--mc-header-bottom)] px-3 py-4 lg:hidden"
            >
              {navLinks}
              <div className="mt-4">{coachChip}</div>
              <div className="mt-3 border-t border-white/15 pt-3">
                {utilityLinks}
              </div>
            </div>
          : null}
        </header>

        <main className="flex-1 px-4 py-7 sm:px-6 lg:px-8">
          <div key={pathname} className="mc-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
