import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/** Full-bleed gym photo + brand teal scrim + elevated auth panel. */
export function AuthShell({
  title,
  subtitle,
  crumbs,
  sideTitle,
  sideBody,
  panelHeading,
  panelSubheading,
  children,
  layout = "single",
  panel = "light",
  image,
  imageAlt = "",
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  crumbs?: Crumb[];
  sideTitle?: React.ReactNode;
  sideBody?: React.ReactNode;
  /** Heading inside the form card. Hidden on small split layouts, where the page title already shows. */
  panelHeading?: React.ReactNode;
  panelSubheading?: React.ReactNode;
  children: React.ReactNode;
  layout?: "split" | "single";
  /** Dark glass for short auth; light elevated for longer register forms. */
  panel?: "dark" | "light";
  /** Page-specific photograph. Omit for a plain brand gradient. */
  image?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[calc(100dvh-4.25rem)] flex-col overflow-x-clip py-10 text-white sm:py-14 lg:py-16",
        !image && "mc-gradient-header",
        className,
      )}
    >
      {image ?
        <>
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="mc-auth-scrim absolute inset-0" aria-hidden />
        </>
      : null}

      <div className="relative z-10 container flex flex-1 flex-col justify-center">
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
          <div
            className="mt-3 h-1 w-14 rounded-full bg-[color:var(--mc-brand-coach)]"
            aria-hidden
          />
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
            layout === "split" ?
              "mx-auto grid w-full max-w-3xl lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
            : "mx-auto w-full max-w-3xl",
          )}
        >
          {layout === "split" ?
            <aside className="mc-auth-side relative hidden min-h-[22rem] flex-col justify-center overflow-hidden p-7 sm:p-8 lg:flex">
              <div className="relative z-10">
                <h2 className="font-display text-2xl font-bold tracking-tight xl:text-3xl">
                  {sideTitle ?? title}
                </h2>
                <div
                  className="mt-3 h-1 w-14 rounded-full bg-[color:var(--mc-brand-coach)]"
                  aria-hidden
                />
                {(sideBody ?? subtitle) ?
                  <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-white/85 xl:max-w-xs">
                    {sideBody ?? subtitle}
                  </p>
                : null}
              </div>
            </aside>
          : null}

          <div
            className={cn(
              "p-5 sm:p-8",
              panel === "light" ? "mc-auth-panel-light" : "mc-auth-panel",
            )}
          >
            {panelHeading ?
              <div
                className={cn("mb-6", layout === "split" && "hidden lg:block")}
              >
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
