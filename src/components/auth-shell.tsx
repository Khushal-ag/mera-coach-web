import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

const trust = [
  { value: "500+", label: "Coach profiles" },
  { value: "Free", label: "To enquire" },
  { value: "1", label: "Practice home" },
] as const;

/**
 * Auth canvas around a white form card.
 * Split layouts keep a viewport-scale trust panel for short forms.
 * Card layout is a centered form (~760px) with an optional short photo banner.
 * The site header owns the wordmark; this shell does not repeat it.
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
  panelHeading?: React.ReactNode;
  panelSubheading?: React.ReactNode;
  children: React.ReactNode;
  /** split: trust panel + narrow form. wide: same panel, wider form. card: centered form, no side column. */
  layout?: "split" | "single" | "wide" | "card";
  panel?: "dark" | "light";
  image?: string;
  imageAlt?: string;
  className?: string;
}) {
  const split = layout === "split" || layout === "wide";
  const card = layout === "card";
  const banner = card && Boolean(image);

  return (
    <section
      className={cn(
        "relative overflow-x-clip bg-[color:var(--mc-explore-canvas)] py-8 text-ink sm:py-12 lg:py-14",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-16 size-[28rem] rounded-full bg-[color:var(--mc-accent)]/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 size-72 rounded-full bg-mc-secondary/10"
        aria-hidden
      />

      <div className="relative z-10 container">
        {crumbs && crumbs.length > 0 ?
          <p className="mb-4 flex flex-wrap items-center gap-y-1 text-sm text-ink-muted">
            {crumbs.map((crumb, index) => (
              <span
                key={`${crumb.label}-${index}`}
                className="inline-flex items-center"
              >
                {index > 0 ?
                  <span className="mx-1.5 text-ink-muted/50" aria-hidden>
                    /
                  </span>
                : null}
                {crumb.href ?
                  <Link
                    href={crumb.href}
                    className="inline-flex min-h-11 items-center hover:text-mc-secondary"
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
            "mx-auto overflow-hidden rounded-[24px] bg-white shadow-[0_30px_80px_rgba(23,134,118,0.16)]",
            layout === "card" ? "w-full max-w-[47.5rem]"
            : layout === "wide" ?
              "grid w-full max-w-[73.5rem] lg:grid-cols-[minmax(22rem,26rem)_minmax(0,1fr)]"
            : split ? "grid max-w-5xl lg:grid-cols-2"
            : "max-w-xl",
          )}
        >
          {banner && image ?
            <div className="relative min-h-36 overflow-hidden">
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                className="object-cover object-[center_30%]"
                sizes="(max-width: 768px) 100vw, 760px"
              />
              <div
                className="absolute inset-0 bg-[linear-gradient(105deg,rgba(23,134,118,0.94)_0%,rgba(23,134,118,0.78)_52%,rgba(23,134,118,0.5)_100%)]"
                aria-hidden
              />
              <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
                <h1 className="font-display text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl">
                  {title}
                </h1>
                {subtitle ?
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85">
                    {subtitle}
                  </p>
                : null}
              </div>
            </div>
          : null}

          {split ?
            <aside className="relative hidden min-h-[28rem] flex-col justify-between overflow-hidden bg-[image:var(--mc-gradient)] p-8 text-white lg:flex xl:p-10">
              {image ?
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  priority
                  className="object-cover opacity-[0.18]"
                  sizes="40vw"
                />
              : null}
              <div
                className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[color:var(--mc-accent)]/15"
                aria-hidden
              />
              <div className="relative z-10">
                <h2 className="font-display text-3xl leading-tight font-extrabold">
                  {sideTitle ?? title}
                </h2>
                {(sideBody ?? subtitle) ?
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
                    {sideBody ?? subtitle}
                  </p>
                : null}
              </div>
              <div className="relative z-10 mt-8 space-y-4">
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-white/8 p-3">
                  {trust.map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="font-display text-lg font-extrabold text-[color:var(--mc-accent)]">
                        {item.value}
                      </p>
                      <p className="text-[10px] text-white/80">{item.label}</p>
                    </div>
                  ))}
                </div>
                <blockquote className="rounded-2xl border border-white/12 bg-white/8 p-4">
                  <p className="text-sm leading-relaxed text-white/80">
                    “The public page and the client list finally live in the
                    same account. I spend the hour coaching, not hunting notes.”
                  </p>
                  <footer className="mt-3 flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-white/15 font-display text-xs font-bold">
                      AK
                    </span>
                    <span>
                      <strong className="block text-sm">
                        A coach on Mera Coach
                      </strong>
                      <span className="text-xs text-white/80">
                        Practice owner
                      </span>
                    </span>
                  </footer>
                </blockquote>
              </div>
            </aside>
          : null}

          <div
            className={cn(
              "p-5 sm:p-8",
              panel === "dark" && "bg-mc-secondary text-white",
            )}
          >
            {banner ? null : (
              <div className={cn(split && "lg:hidden")}>
                <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {title}
                </h1>
                {subtitle ?
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      panel === "dark" ? "text-white/70" : "text-ink-muted",
                    )}
                  >
                    {subtitle}
                  </p>
                : null}
              </div>
            )}
            {panelHeading ?
              <div
                className={cn("mb-6", split && "mt-6 hidden lg:mt-0 lg:block")}
              >
                <h2
                  className={cn(
                    "font-display text-2xl font-extrabold tracking-tight",
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
            <div className={cn(split && "mt-6 lg:mt-0")}>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
