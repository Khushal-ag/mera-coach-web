import Link from "next/link";

import { ArrowLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type PracticeCrumb = {
  label: string;
  href?: string;
};

export type PracticeBackLink = {
  href: string;
  label: string;
};

/**
 * Coach surfaces use one radius: 16px panels, 10px controls, pill chips.
 * The gold rule sits on the page title only.
 */
export function PracticePageHeader({
  title,
  description,
  action,
  crumbs,
  back,
  leading,
  icon,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  crumbs?: PracticeCrumb[];
  back?: PracticeBackLink;
  leading?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 min-w-0", className)}>
      {back ?
        <Link
          href={back.href}
          className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mc-secondary hover:underline"
        >
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          {back.label}
        </Link>
      : crumbs?.length ?
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1.5 text-[13px] text-ink-muted"
        >
          {crumbs.map((crumb, index) => (
            <span
              key={`${crumb.label}-${index}`}
              className="inline-flex items-center gap-1.5"
            >
              {index > 0 ?
                <ChevronRight className="size-2.5 shrink-0" aria-hidden />
              : null}
              {crumb.href ?
                <Link
                  href={crumb.href}
                  className="font-semibold text-mc-secondary hover:underline"
                >
                  {crumb.label}
                </Link>
              : <span>{crumb.label}</span>}
            </span>
          ))}
        </nav>
      : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {icon ?
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mc-secondary-light text-mc-secondary">
              {icon}
            </span>
          : leading}
          <div className="min-w-0">
            <h1 className="font-display text-[1.85rem] leading-[1.15] font-bold tracking-tight text-ink sm:text-[2.15rem]">
              {title}
            </h1>
            <div
              className="mt-3 h-1 w-11 rounded-full bg-mc-brand-coach"
              aria-hidden
            />
            {description != null && description !== "" ?
              typeof description === "string" ?
                <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-muted">
                  {description}
                </p>
              : <div className="mt-3 min-w-0">{description}</div>
            : null}
          </div>
        </div>
        {action ?
          <div className="w-full shrink-0 sm:w-auto">{action}</div>
        : null}
      </div>
    </header>
  );
}

/** Left-aligned empty state. The action sits with the sentence, not in the middle of the page. */
export function PracticeEmpty({
  title,
  body,
  href,
  cta,
  action,
  icon,
  stacked = false,
  plain = false,
  className,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  stacked?: boolean;
  plain?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-start justify-center gap-4",
        plain ? "px-1 py-4" : (
          "rounded-2xl border border-l-[3px] border-[#e5d5c5] border-l-mc-secondary bg-[#fdf8f2] px-5 py-6"
        ),
        !plain &&
          !stacked &&
          "sm:flex-row sm:items-center sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ?
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mc-secondary-light text-mc-secondary">
            {icon}
          </span>
        : null}
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-ink">{title}</p>
          <p className="mt-1.5 max-w-[46ch] text-sm leading-relaxed text-ink-muted">
            {body}
          </p>
        </div>
      </div>
      {action ?
        <div className="shrink-0">{action}</div>
      : href && cta ?
        <Link href={href} className="mc-btn-primary w-full shrink-0 sm:w-auto">
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
