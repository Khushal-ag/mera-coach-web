import Link from "next/link";

import { cn } from "@/lib/utils";

export function PracticePageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description ?
          <p className="mt-1 max-w-[52ch] text-sm text-ink-muted">
            {description}
          </p>
        : null}
      </div>
      {action ?
        <div className="shrink-0">{action}</div>
      : null}
    </div>
  );
}

export function PracticeEmpty({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[40ch] text-sm text-ink-muted">{body}</p>
      {href && cta ?
        <Link href={href} className="mc-btn-primary mt-6 inline-flex">
          {cta}
        </Link>
      : null}
    </div>
  );
}
