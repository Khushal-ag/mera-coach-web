import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import { siteConfig } from "@/config/site";

const exploreLinks = [
  { label: "Find a coach", href: "/coach" },
  { label: "Services", href: "/services" },
  { label: "BMI calculator", href: "/bmi" },
] as const;

const accountLinks = [
  { label: "Register", href: "/register" },
  { label: "Coach login", href: "/coach-login" },
  { label: "Member login", href: "/member-login" },
] as const;

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/75 transition-colors hover:text-[color:var(--mc-brand-coach)]";

export function SiteFooter() {
  return (
    <footer className="bg-[color:var(--mc-header-bottom)] text-white">
      <div className="container grid gap-10 py-14 sm:py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr] lg:gap-12">
        <div>
          <BrandLockup variant="nav" className="text-xl sm:text-2xl" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Get found by clients. Grow your coaching. For personal trainers,
            fitness coaches, and dieticians.
          </p>
          <a
            href={`mailto:${siteConfig.email.team}`}
            className="mt-5 inline-flex min-h-11 items-center text-sm break-all text-white/80 transition-colors hover:text-[color:var(--mc-brand-coach)]"
          >
            {siteConfig.email.team}
          </a>
        </div>

        <div>
          <p className="font-display text-sm font-bold text-white">Explore</p>
          <ul className="mt-3 space-y-0.5">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold text-white">Account</p>
          <ul className="mt-3 space-y-0.5">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold text-white">Legal</p>
          <ul className="mt-3 space-y-0.5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-5 text-sm text-white/55">
          <p>© 2026 Mera Coach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
