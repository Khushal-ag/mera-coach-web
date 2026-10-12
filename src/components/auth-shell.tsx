import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/**
 * Photographic auth layout inspired by the legacy coach-login page:
 * full-bleed gym photo + brand teal scrim + elevated glass card.
 */
export function AuthShell({
  title,
  subtitle,
  crumbs,
  sideTitle,
  sideBody,
  panelHeading,
  panelSubheading,
  children,
  layout = "split",
  panel = "dark",
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: Crumb[];
  sideTitle?: React.ReactNode;
  sideBody?: React.ReactNode;
  /** Desktop-only heading inside the form panel (split layout). */
  panelHeading?: React.ReactNode;
  panelSubheading?: React.ReactNode;
  children: React.ReactNode;
  layout?: "split" | "single";
  /** Dark glass for short auth; light elevated for longer register forms. */
  panel?: "dark" | "light";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate min-h-[80dvh] overflow-x-clip py-10 text-white sm:py-14 lg:py-20",
        className,
      )}
    >
      <Image
        src="/mc-images/coachloginbg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="mc-auth-scrim absolute inset-0" aria-hidden />

      <div className="relative z-10 container">
        {crumbs && crumbs.length > 0 ?
          <p className="motion-rise flex flex-wrap items-center gap-y-1 text-sm text-white/70">
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
                    className="inline-flex min-h-11 items-center transition-colors hover:text-[color:var(--mc-brand-coach)]"
                  >
                    {crumb.label}
                  </Link>
                : <span>{crumb.label}</span>}
              </span>
            ))}
          </p>
        : null}

        <div
          className={cn(
            "motion-rise motion-rise-delay-1 mt-4 sm:mt-5",
            layout === "split" && "lg:hidden",
          )}
        >
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {subtitle ?
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              {subtitle}
            </p>
          : null}
        </div>

        <div
          className={cn(
            "motion-rise motion-rise-delay-2 mt-6 sm:mt-8",
            panel === "light" ? "mc-auth-card-light" : "mc-auth-card",
            layout === "split" ? "grid lg:grid-cols-2" : "mx-auto max-w-3xl",
          )}
        >
          {layout === "split" ?
            <aside className="mc-auth-side relative hidden flex-col justify-center overflow-hidden p-8 sm:p-10 lg:flex">
              <div
                className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-[color:var(--mc-brand-coach)]/20 blur-3xl"
                aria-hidden
              />
              <div className="relative z-10">
                <p className="text-xs font-semibold tracking-[0.14em] text-white/65 uppercase">
                  Coach portal
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
                  {sideTitle ?? title}
                </h2>
                {(sideBody ?? subtitle) ?
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
                    {sideBody ?? subtitle}
                  </p>
                : null}
              </div>
            </aside>
          : null}

          <div
            className={cn(
              "p-5 sm:p-8",
              layout === "single" && "sm:p-10",
              panel === "light" ? "mc-auth-panel-light" : "mc-auth-panel",
            )}
          >
            {layout === "split" && panelHeading ?
              <div className="mb-6 hidden lg:block">
                <h2
                  className={cn(
                    "font-display text-2xl font-bold tracking-tight",
                    panel === "light" && "text-ink",
                  )}
                >
                  {panelHeading}
                </h2>
                {panelSubheading ?
                  <p
                    className={cn(
                      "mt-1.5 text-sm",
                      panel === "light" ? "text-ink-muted" : "text-white/65",
                    )}
                  >
                    {panelSubheading}
                  </p>
                : null}
              </div>
            : null}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
