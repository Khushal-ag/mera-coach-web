import Link from "next/link";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/** Typographic brand header for legal and confirmation pages. Marketing pages compose their own photography. */
export function PageHero({
  title,
  subtitle,
  crumbs,
  className,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: Crumb[];
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "mc-gradient-header relative overflow-x-clip py-12 text-white sm:py-14 lg:py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-20 size-72 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 size-80 rounded-full bg-[color:var(--mc-brand-coach)]/10 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 container">
        {crumbs && crumbs.length > 0 ?
          <p className="flex flex-wrap items-center gap-y-1 text-sm text-white/70">
            {crumbs.map((crumb, index) => (
              <span
                key={`${crumb.label}-${index}`}
                className="inline-flex items-center"
              >
                {index > 0 ?
                  <span className="mx-1.5 text-white/40" aria-hidden>
                    ›
                  </span>
                : null}
                {crumb.href ?
                  <Link
                    href={crumb.href}
                    className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
                  >
                    {crumb.label}
                  </Link>
                : <span>{crumb.label}</span>}
              </span>
            ))}
          </p>
        : null}
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <div
          className="motion-underline mt-3 h-1 w-14 origin-left rounded-full bg-[color:var(--mc-brand-coach)] sm:mt-4"
          aria-hidden
        />
        {subtitle ?
          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-white/80 sm:text-base lg:text-lg">
            {subtitle}
          </p>
        : null}
        {children}
      </div>
    </section>
  );
}
