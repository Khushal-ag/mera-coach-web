import Link from "next/link";

import { siteConfig } from "@/config/site";

const platformLinks = [
  { label: "Find a coach", href: "/coach" },
  { label: "Services", href: "/services" },
  { label: "BMI calculator", href: "/bmi" },
  { label: "Feedback", href: "/feedback" },
] as const;

const coachLinks = [
  { label: "Become a coach", href: "/register" },
  { label: "Coach login", href: "/coach-login" },
  { label: "Premium", href: "/premium" },
  { label: "Member login", href: "/member-login" },
] as const;

const companyLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/80 transition-colors hover:text-mc-brand-coach";

export function SiteFooter() {
  return (
    <footer className="bg-mc-header-bottom text-white">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.9fr_1fr] lg:gap-12 lg:py-16">
        <div>
          <p className="font-display text-sm font-bold text-white">
            Mera Coach
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
            India&apos;s coaching and wellness platform connecting people with
            health, fitness, yoga, and nutrition coaches, and giving those
            coaches one place to run the practice.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold text-white">
            Platform
          </h2>
          <ul className="mt-3">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold text-white">
            For coaches
          </h2>
          <ul className="mt-3">
            {coachLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold text-white">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>
              <a
                href={`mailto:${siteConfig.email.team}`}
                className="inline-flex min-h-11 items-center break-all hover:text-mc-brand-coach"
              >
                {siteConfig.email.team}
              </a>
            </li>
            <li className="leading-relaxed">
              Questions about a coach profile or Premium checkout.
            </li>
          </ul>
          <h3 className="mt-6 font-display text-sm font-bold text-white">
            Company
          </h3>
          <ul className="mt-2">
            {companyLinks.map((link) => (
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
        <div className="container flex flex-col gap-2 py-5 text-sm text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Mera Coach. All rights reserved.</p>
          <p>Made for a healthier coaching practice.</p>
        </div>
      </div>
    </footer>
  );
}
