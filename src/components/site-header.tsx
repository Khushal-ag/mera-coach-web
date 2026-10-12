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
    <header className="sticky top-0 z-50 border-b border-line bg-surface text-ink">
      <div className="relative container flex h-16 items-center justify-between gap-3 lg:h-[4.25rem]">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center"
          onClick={() => setOpen(false)}
          aria-label={siteConfig.name}
        >
          <BrandLockup variant="workspace" priority />
        </Link>

        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-line text-ink transition hover:bg-paper lg:hidden"
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
            "absolute top-full right-0 left-0 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-surface px-4 py-4 shadow-lg lg:static lg:flex lg:max-h-none lg:min-w-0 lg:flex-1 lg:items-center lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none",
            open ? "block" : "hidden lg:flex",
          )}
        >
          <ul className="flex flex-col gap-1 lg:mx-auto lg:min-w-0 lg:flex-row lg:items-center lg:gap-0.5 xl:gap-1">
            {siteConfig.nav.map((item) => {
              if (signedIn && item.href === "/register") return null;
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-[10px] px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:rounded-none lg:px-2 lg:py-1 xl:px-3",
                      active ?
                        "bg-[color:var(--mc-secondary-light)] font-semibold text-mc-secondary lg:bg-transparent"
                      : "text-ink-muted hover:bg-paper hover:text-mc-secondary lg:hover:bg-transparent",
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

          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:flex-wrap sm:items-center lg:ms-auto lg:mt-0 lg:shrink-0 lg:border-0 lg:pt-0">
            {signedIn && session ?
              <>
                <p className="max-w-[12rem] truncate text-sm font-semibold text-ink sm:max-w-[10rem] lg:hidden xl:block xl:max-w-[9rem]">
                  {session.fullName}
                </p>
                <Link
                  href={premiumHref(session)}
                  className="mc-btn-secondary min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Premium
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    "mc-btn-secondary min-h-11 w-full justify-center px-4 text-sm whitespace-nowrap sm:w-auto",
                    onDashboard &&
                      "ring-2 ring-mc-secondary/30 ring-offset-2 ring-offset-surface",
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
                    onRegister ? "mc-btn-primary" : "mc-btn-secondary",
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
                    onRegister ? "mc-btn-secondary" : "mc-btn-primary",
                    onCoachLogin &&
                      "ring-2 ring-mc-secondary/30 ring-offset-2 ring-offset-surface",
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
