"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Match nav hrefs on segment boundaries so `/coach` does not highlight on `/coach-login`. */
function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState(pathname);
  const navId = useId();

  // Close the drawer when the route changes (render-time adjust, not an effect).
  if (openForPath !== pathname) {
    setOpenForPath(pathname);
    if (open) setOpen(false);
  }

  const onCoachLogin = isNavActive(pathname, "/coach-login");
  const onRegister = isNavActive(pathname, "/register");

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
      <div className="relative container flex items-center justify-between gap-3 py-3 sm:gap-4">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center gap-2.5 font-display text-base font-bold tracking-tight text-white sm:text-lg"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/mc-images/meracoach.png"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
            priority
          />
          <span className="truncate">
            <span className="text-[color:var(--mc-brand-mera-on-dark)]">
              Mera
            </span>{" "}
            <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
          </span>
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
          <ul className="flex flex-col gap-1 lg:mx-auto lg:flex-row lg:items-center lg:gap-1 xl:gap-5">
            {siteConfig.nav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 items-center rounded-[10px] px-3 py-2 text-sm font-medium transition-colors lg:rounded-none lg:px-2",
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

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row lg:ms-auto lg:mt-0 lg:border-0 lg:pt-0">
            <Link
              href="/register"
              className={cn(
                "min-h-11 w-full justify-center px-4 text-sm sm:w-auto",
                onRegister ? "mc-btn-primary" : "mc-btn-outline-on-dark",
              )}
              aria-current={onRegister ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Register Coach
            </Link>
            <Link
              href="/coach-login"
              className={cn(
                "min-h-11 w-full justify-center px-4 text-sm sm:w-auto",
                onRegister ? "mc-btn-outline-on-dark" : "mc-btn-primary",
                onCoachLogin &&
                  "ring-2 ring-[color:var(--mc-brand-coach)]/40 ring-offset-2 ring-offset-[color:var(--mc-header-bottom)]",
              )}
              aria-current={onCoachLogin ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Coach Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
