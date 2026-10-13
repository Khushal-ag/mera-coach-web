import Link from "next/link";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/**
 * Teal page banner: soft circles, breadcrumb, title with an accent word.
 */
export function PageBanner({
  crumbs,
  eyebrow,
  title,
  emphasis,
  subtitle,
  children,
  className,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  emphasis?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-[image:var(--mc-gradient)] text-white",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-16 size-[28rem] rounded-full bg-white/6"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-white/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 right-[18%] size-36 rounded-full bg-[color:var(--mc-accent)]/20"
        aria-hidden
      />
      <div className="relative z-10 container py-12 sm:py-16 lg:py-20">
        {crumbs && crumbs.length > 0 ?
          <p className="flex flex-wrap items-center gap-y-1 text-sm text-white/70">
            {crumbs.map((crumb, index) => (
              <span
                key={`${crumb.label}-${index}`}
                className="inline-flex items-center"
              >
                {index > 0 ?
                  <span className="mx-1.5 text-white/35" aria-hidden>
                    /
                  </span>
                : null}
                {crumb.href ?
                  <Link
                    href={crumb.href}
                    className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-accent)]"
                  >
                    {crumb.label}
                  </Link>
                : <span className="text-white/90">{crumb.label}</span>}
              </span>
            ))}
          </p>
        : null}
        {eyebrow ?
          <p className="mt-4 inline-flex items-center rounded-full border border-[color:var(--mc-accent)]/35 bg-[color:var(--mc-accent)]/15 px-3 py-1 font-display text-xs font-bold tracking-wide text-[color:var(--mc-accent)]">
            {eyebrow}
          </p>
        : null}
        <h1 className="mt-3 max-w-3xl font-display text-[2rem] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-5xl">
          {title}
          {emphasis ?
            <>
              {" "}
              <em className="font-extrabold text-[color:var(--mc-accent)] not-italic">
                {emphasis}
              </em>
            </>
          : null}
        </h1>
        {subtitle ?
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            {subtitle}
          </p>
        : null}
        {children}
      </div>
    </section>
  );
}
