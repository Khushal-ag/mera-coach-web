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

  const onCoachLogin = isNavActive(pathname, "/coach-login");
  const onDashboard = isNavActive(pathname, "/dashboard");
  const onRegister = isNavActive(pathname, "/register");
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color:var(--mc-header-bottom)]/95 text-white backdrop-blur-md">
      <div className="relative container flex h-16 items-center justify-between gap-3 lg:h-[4.25rem]">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center"
          onClick={() => setOpen(false)}
          aria-label={siteConfig.name}
        >
          <BrandLockup variant="nav" priority />
        </Link>

        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-white/20 text-white transition hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls={navId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ?
            <X className="size-5" aria-hidden />
          : <Menu className="size-5" aria-hidden />}
        </button>

        <nav
          id={navId}
          className={cn(
            "absolute top-full right-0 left-0 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-white/10 bg-[color:var(--mc-header-bottom)] px-4 py-4 shadow-lg lg:static lg:flex lg:max-h-none lg:flex-1 lg:items-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none",
            open ? "block" : "hidden lg:flex",
          )}
        >
          <ul className="flex flex-col gap-1 lg:mx-auto lg:flex-row lg:items-center lg:gap-1">
            {siteConfig.nav.map((item) => {
              if (signedIn && item.href === "/register") return null;
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-[10px] px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:min-h-0 lg:rounded-none lg:px-3 lg:py-1",
                      active ?
                        "bg-white/10 text-[color:var(--mc-brand-coach)] lg:bg-transparent"
                      : "text-white/80 hover:bg-white/5 hover:text-[color:var(--mc-brand-coach)] lg:hover:bg-transparent",
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:flex-wrap sm:items-center lg:ms-auto lg:mt-0 lg:shrink-0 lg:border-0 lg:pt-0">
            {signedIn && session ?
              <>
                <p className="max-w-[12rem] truncate text-sm font-semibold text-white/90 sm:max-w-[10rem] lg:max-w-[9rem]">
                  {session.fullName}
                </p>
                <Link
                  href={premiumHref(session)}
                  className="mc-btn-outline-on-dark min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Premium
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    "mc-btn-outline-on-dark min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto",
                    onDashboard &&
                      "ring-2 ring-[color:var(--mc-brand-coach)]/40 ring-offset-2 ring-offset-[color:var(--mc-header-bottom)]",
                  )}
                  aria-current={onDashboard ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="mc-btn-primary min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  Logout
                </button>
              </>
            : <>
                <Link
                  href="/register"
                  className={cn(
                    "min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto",
                    onRegister ? "mc-btn-primary" : "mc-btn-outline-on-dark",
                  )}
                  aria-current={onRegister ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  Start as a Coach
                </Link>
                <Link
                  href="/coach-login"
                  className={cn(
                    "min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto",
                    onRegister ? "mc-btn-outline-on-dark" : "mc-btn-primary",
                    onCoachLogin &&
                      "ring-2 ring-[color:var(--mc-brand-coach)]/40 ring-offset-2 ring-offset-[color:var(--mc-header-bottom)]",
                  )}
                  aria-current={onCoachLogin ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  Coach Login
                </Link>
              </>
            }
          </div>
        </nav>
      </div>
    </header>
  );
}
