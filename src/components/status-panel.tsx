import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type Props = {
  code?: string;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** When true, panel fills the viewport (global-error / standalone). */
  fullViewport?: boolean;
};

/**
 * Branded empty / error / loading status surface — matches header greens + brandCoach.
 */
export function StatusPanel({
  code,
  title,
  description,
  children,
  className,
  fullViewport,
}: Props) {
  return (
    <section
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden bg-paper px-6 py-16 text-center text-ink",
        fullViewport ? "min-h-dvh" : "min-h-[60dvh]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[color:var(--mc-header-bottom)]/12 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-24 -left-16 size-56 rounded-full bg-[color:var(--mc-secondary)]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-16 size-48 rounded-full bg-[color:var(--mc-brand-coach)]/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-4">
        <Image
          src={siteConfig.brand.logoMark}
          alt=""
          width={56}
          height={56}
          className="mb-1 size-14 object-contain"
        />
        {code ?
          <p className="text-xs font-bold tracking-[0.2em] text-mc-secondary uppercase">
            {code}
          </p>
        : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <div className="h-1 w-12 rounded-full bg-mc-brand-coach" aria-hidden />
        <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
        {children ?
          <div className="mt-2 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            {children}
          </div>
        : null}
      </div>
    </section>
  );
}

export function StatusHomeLink({
  className,
  label = "Back to home",
  variant = "primary",
}: {
  className?: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href="/"
      className={cn(
        variant === "secondary" ? "mc-btn-secondary" : "mc-btn-primary",
        className,
      )}
    >
      {label}
    </Link>
  );
}
