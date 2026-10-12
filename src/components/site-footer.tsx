import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--mc-header-bottom)] text-white">
      <div className="container grid gap-10 py-10 sm:py-12 md:grid-cols-3 md:items-start md:gap-8">
        <div>
          <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            <span className="text-[color:var(--mc-brand-mera-on-dark)]">
              Mera
            </span>{" "}
            <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Online platform for health and wellness coaches, fitness coaches,
            and dieticians to manage clients easily.
          </p>
        </div>

        <div className="text-sm text-white/70 md:text-center">
          <p className="font-display text-sm font-bold text-white">Explore</p>
          <ul className="mt-3 space-y-1">
            <li>
              <Link
                href="/coach"
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Find a Coach
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/premium"
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Premium
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm text-white/75 md:text-right">
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
            <Link
              href="/member-login"
              className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
            >
              Member Login
            </Link>
            <span className="hidden text-white/40 sm:inline" aria-hidden>
              |
            </span>
            <Link
              href="/coach-login"
              className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
            >
              Coach Login
            </Link>
          </div>
          <p className="mt-2 sm:mt-3">
            <a
              href={`mailto:${siteConfig.email.team}`}
              className="inline-flex min-h-11 items-center break-all text-white/55 hover:text-[color:var(--mc-brand-coach)]"
            >
              {siteConfig.email.team}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Mera Coach. All Rights Reserved.</p>
          <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
            <li>
              <Link
                href={siteConfig.links.terms}
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link
                href={siteConfig.links.privacy}
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={siteConfig.links.feedback}
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Feedback
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
