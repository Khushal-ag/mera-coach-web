import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Coaching photography. Used once, on the dashboard overview. */
export const practicePhotos = {
  overview: "/mc-images/coaching-session.jpg",
  clients: "/mc-images/coach-client-pair.jpg",
  leads: "/mc-images/coachloginbg.jpg",
  checkups: "/mc-images/coach-guidance.jpg",
  packages: "/mc-images/coachbg.jpg",
  events: "/mc-images/coaching-session.jpg",
  profile: "/mc-images/coach-guidance.jpg",
  password: "/mc-images/coachloginbg.jpg",
  addClient: "/mc-images/coach-client-pair.jpg",
} as const;

export function PracticePageHeader({
  title,
  description,
  action,
  className,
  image = practicePhotos.overview,
  variant = "work",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  image?: string;
  /** `band` is the overview only. Working pages stay typographic. */
  variant?: "work" | "band";
}) {
  if (variant === "band") {
    return (
      <header
        className={cn(
          "relative mb-6 overflow-hidden rounded-[var(--radius-md)] text-white sm:mb-8",
          className,
        )}
      >
        <div className="relative min-h-[7.5rem] sm:min-h-[8.5rem]">
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 72rem"
            className="object-cover object-[center_30%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[color:var(--mc-header-bottom)]/94 via-[color:var(--mc-header-bottom)]/70 to-[color:var(--mc-header-top)]/35"
            aria-hidden
          />
          <div className="relative flex min-h-[7.5rem] flex-col justify-end gap-4 px-5 py-5 sm:min-h-[8.5rem] sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
            <div className="max-w-[62ch] min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h1>
              {description ?
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  {description}
                </p>
              : null}
            </div>
            {action ?
              <div className="shrink-0">{action}</div>
            : null}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-[65ch] min-w-0">
        <h1 className="font-display text-[1.75rem] leading-[1.15] font-bold tracking-tight text-ink sm:text-[2rem]">
          {title}
        </h1>
        {description ?
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        : null}
      </div>
      {action ?
        <div className="shrink-0">{action}</div>
      : null}
    </header>
  );
}

export function PracticeEmpty({
  title,
  body,
  href,
  cta,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
  action?: React.ReactNode;
  image?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface px-6 py-10 sm:px-8">
      <p className="font-display text-xl font-bold text-ink">{title}</p>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-ink-muted">
        {body}
      </p>
      {action ?
        <div className="mt-5">{action}</div>
      : href && cta ?
        <Link href={href} className="mc-btn-primary mt-5 w-fit">
          {cta}
        </Link>
      : null}
    </div>
  );
}

export function PracticeSearch({
  id,
  label,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
}) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <label htmlFor={id} className="mc-field-label">
        {label}
      </label>
      <input id={id} className="mc-field" {...props} />
    </div>
  );
}

export function PracticeRosterSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="mc-roster" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0"
        >
          <div className="mc-skeleton h-4 w-36" />
          <div className="mc-skeleton hidden h-4 w-24 sm:block" />
          <div className="mc-skeleton ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
