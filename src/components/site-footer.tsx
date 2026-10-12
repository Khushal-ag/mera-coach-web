import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import { siteConfig } from "@/config/site";

const exploreLinks = [
  { label: "Find a Coach", href: "/coach" },
  { label: "BMI calculator", href: "/bmi" },
  { label: "Services", href: "/services" },
  { label: "Premium", href: "/premium" },
] as const;

const accountLinks = [
  { label: "Member Login", href: "/member-login" },
  { label: "Coach Login", href: "/coach-login" },
] as const;

const legalLinks = [
  { label: "Terms & Conditions", href: siteConfig.links.terms },
  { label: "Privacy Policy", href: siteConfig.links.privacy },
  { label: "Feedback", href: siteConfig.links.feedback },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--mc-header-bottom)] text-white">
      <div className="container grid gap-12 py-14 sm:py-16 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div>
          <BrandLockup variant="nav" className="text-xl sm:text-2xl" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
            Get found by clients. Grow your coaching business. For personal
            trainers, fitness coaches, and dieticians.
          </p>
          <a
            href={`mailto:${siteConfig.email.team}`}
            className="mt-5 inline-flex min-h-11 items-center text-sm break-all text-white/55 transition hover:text-[color:var(--mc-brand-coach)]"
          >
            {siteConfig.email.team}
          </a>
        </div>

        <div>
          <p className="font-display text-sm font-bold text-white">Explore</p>
          <ul className="mt-4 space-y-1">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm text-white/70 transition hover:text-[color:var(--mc-brand-coach)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold text-white">Account</p>
          <ul className="mt-4 space-y-1">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-sm text-white/70 transition hover:text-[color:var(--mc-brand-coach)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-4 py-5 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Mera Coach. All Rights Reserved.</p>
          <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center transition hover:text-[color:var(--mc-brand-coach)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
