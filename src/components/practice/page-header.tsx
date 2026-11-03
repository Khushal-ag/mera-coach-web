import Link from "next/link";

import { cn } from "@/lib/utils";

export type PracticeCrumb = {
  label: string;
  href?: string;
};

export type PracticeBackLink = {
  href: string;
  label: string;
  /** For a "page" that is only a state of the current route: runs instead of following the link. */
  onClick?: () => void;
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
    <header className={cn("clt-page-head mb-6 min-w-0", className)}>
      <div className="flex min-w-0 items-start gap-4">
        {icon ?
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mc-secondary-light text-mc-secondary">
            {icon}
          </span>
        : leading}
        <div className="min-w-0">
          <h1 className="clt-page-title">{title}</h1>
          {back ?
            <nav className="clt-breadcrumb" aria-label="Breadcrumb">
              <Link
                href={back.href}
                onClick={
                  back.onClick ?
                    (event) => {
                      event.preventDefault();
                      back.onClick?.();
                    }
                  : undefined
                }
              >
                <i className="fas fa-arrow-left" /> {back.label}
              </Link>
            </nav>
          : crumbs?.length ?
            <nav className="clt-breadcrumb" aria-label="Breadcrumb">
              {crumbs.map((crumb, index) => (
                <span
                  key={`${crumb.label}-${index}`}
                  className="inline-flex items-center gap-1.5"
                >
                  {index > 0 ?
                    <i className="fas fa-chevron-right" />
                  : null}
                  {crumb.href ?
                    <Link href={crumb.href}>{crumb.label}</Link>
                  : <span>{crumb.label}</span>}
                </span>
              ))}
            </nav>
          : null}
          {description != null && description !== "" ?
            typeof description === "string" ?
              <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-ink-muted">
                {description}
              </p>
            : <div className="mt-2 min-w-0">{description}</div>
          : null}
        </div>
      </div>
      {action ?
        <div className="w-full shrink-0 sm:w-auto">{action}</div>
      : null}
    </header>
  );
}
