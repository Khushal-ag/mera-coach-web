"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { BrandLockup } from "@/components/brand-lockup";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Match nav hrefs on segment boundaries so `/coach` does not highlight on `/coach-login`. */
function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function premiumHref(session: { coachId: number; coachCode: string }) {
  const qs = new URLSearchParams();
  if (session.coachId > 0) qs.set("coachId", String(session.coachId));
  if (session.coachCode) qs.set("coachCode", session.coachCode);
  return qs.toString() ? `/premium?${qs.toString()}` : "/premium";
}

function HeaderActions({
  surface,
  signedIn,
  session,
  onNavigate,
  onLogout,
}: {
  surface: "light" | "dark";
  signedIn: boolean;
  session: { coachId: number; coachCode: string } | null;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const width = surface === "dark" ? "w-full" : "w-full sm:w-auto";
  const secondary =
    surface === "dark" ?
      `mc-btn-outline-on-dark min-h-11 justify-center px-4 text-sm ${width}`
    : `mc-btn-secondary min-h-11 justify-center px-4 text-sm ${width}`;
  const primary = `mc-btn-primary min-h-11 justify-center px-5 text-sm ${width}`;

  if (signedIn && session) {
    return (
      <>
        <Link
          href={premiumHref(session)}
          className={secondary}
          onClick={onNavigate}
        >
          Premium
        </Link>
        <Link href="/dashboard" className={secondary} onClick={onNavigate}>
          Dashboard
        </Link>
        <button type="button" className={primary} onClick={onLogout}>
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/coach-login" className={secondary} onClick={onNavigate}>
        Login
      </Link>
      <Link href="/register" className={primary} onClick={onNavigate}>
        Join Free
      </Link>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { session, ready, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState(pathname);
  const navId = useId();

  if (openForPath !== pathname) {
    setOpenForPath(pathname);
    if (open) setOpen(false);
  }

  const signedIn = ready && !!session;

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

  const linkClass = (href: string) =>
    cn(
      "flex min-h-11 items-center rounded-lg px-3 font-display text-sm font-medium whitespace-nowrap transition-colors lg:px-3.5",
      isNavActive(pathname, href) ?
        "bg-mc-secondary-light font-semibold text-mc-secondary"
      : "text-ink hover:bg-mc-secondary-light hover:text-mc-secondary",
    );

  const actions = (
    <HeaderActions
      surface="light"
      signedIn={signedIn}
      session={session}
      onNavigate={() => setOpen(false)}
      onLogout={() => {
        setOpen(false);
        void logout();
      }}
    />
  );

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[image:linear-gradient(90deg,var(--mc-header-top),var(--mc-header-bottom))] text-white">
        <div className="container flex h-9 items-center justify-between gap-3 text-[11px] sm:text-xs">
          <p className="truncate font-medium tracking-wide text-white/80">
            Wellness platform for coaches and the people who train with them
          </p>
          <p className="hidden shrink-0 items-center gap-3 sm:flex">
            <Link href="/bmi" className="hover:text-mc-brand-coach">
              BMI calculator
            </Link>
            <Link href="/premium" className="hover:text-mc-brand-coach">
              Premium
            </Link>
          </p>
        </div>
      </div>

      <div className="border-b-[3px] border-mc-secondary bg-[color:var(--paper)]/96 text-ink shadow-[0_8px_24px_rgba(23,134,118,0.08)] backdrop-blur-md">
        <div className="container flex h-[4.25rem] items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-h-11 min-w-0 items-center"
            onClick={() => setOpen(false)}
            aria-label={siteConfig.name}
          >
            <BrandLockup variant="workspace" priority />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-0.5">
              {siteConfig.nav.map((item) => {
                if (signedIn && item.href === "/register") return null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={linkClass(item.href)}
                      aria-current={
                        isNavActive(pathname, item.href) ? "page" : undefined
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">{actions}</div>

          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ?
              <X className="size-5" aria-hidden />
            : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open ?
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id={navId}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,calc(100vw-2.5rem))] flex-col border-l border-line bg-white px-5 py-6 text-ink shadow-[-12px_0_40px_rgba(23,134,118,0.16)]"
          >
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-xl border border-line text-ink"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="mt-8 flex flex-1 flex-col gap-1">
              {siteConfig.nav.map((item) => {
                if (signedIn && item.href === "/register") return null;
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-3 font-display text-base font-semibold",
                      active ?
                        "bg-mc-secondary-light text-mc-secondary"
                      : "text-ink hover:bg-mc-secondary-light hover:text-mc-secondary",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <HeaderActions
                surface="light"
                signedIn={signedIn}
                session={session}
                onNavigate={() => setOpen(false)}
                onLogout={() => {
                  setOpen(false);
                  void logout();
                }}
              />
            </div>
          </aside>
        </div>
      : null}
    </header>
  );
}
