import Link from "next/link";

import { Mail } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { siteConfig } from "@/config/site";

const platformLinks = [
  { label: "Find a Coach", href: "/coach" },
  { label: "Features", href: "/services" },
  { label: "BMI Calculator", href: "/bmi" },
  { label: "Tips", href: "/#tips" },
  { label: "Feedback", href: "/feedback" },
] as const;

const coachLinks = [
  { label: "Become a Coach", href: "/register" },
  { label: "Coach Login", href: "/coach-login" },
  { label: "Coach Dashboard", href: "/dashboard" },
  { label: "Premium", href: "/premium" },
] as const;

const companyLinks = [
  { label: "About", href: "/#path" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Feedback", href: "/feedback" },
] as const;

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/55 transition-colors hover:text-mc-primary";

export function SiteFooter() {
  return (
    <footer className="bg-mc-header-bottom text-white">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandLockup variant="nav" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
            India&apos;s coaching and wellness platform. Find a health, fitness,
            yoga, or nutrition coach, or run your own practice from one public
            page.
          </p>
        </div>

        <div>
          <h2 className="font-display text-[15px] font-bold text-white">
            Platform
          </h2>
          <ul className="mt-3">
            {platformLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-[15px] font-bold text-white">
            For Coaches
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
          <h2 className="font-display text-[15px] font-bold text-white">
            Company
          </h2>
          <ul className="mt-3">
            {companyLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-[15px] font-bold text-white">
            Contact Us
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/55">
            <li>
              <a
                href={`mailto:${siteConfig.email.team}`}
                className="inline-flex min-h-11 items-start gap-2 break-all hover:text-mc-primary"
              >
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                {siteConfig.email.team}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email.support}`}
                className="inline-flex min-h-11 items-start gap-2 break-all hover:text-mc-primary"
              >
                <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                {siteConfig.email.support}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="container flex flex-col gap-3 py-5 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Mera Coach. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
