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
 * Branded empty / error / loading status surface. Explore ground, teal header.
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
        "relative flex flex-col items-center justify-center overflow-hidden bg-[color:var(--mc-explore-canvas)] px-6 py-16 text-center text-ink",
        fullViewport ? "min-h-dvh" : "min-h-[70dvh]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[color:var(--mc-accent)]/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-mc-secondary/10"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-lg overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_24px_60px_rgba(23,134,118,0.12)]">
        <div className="bg-[image:var(--mc-gradient)] px-6 py-8 text-white">
          {fullViewport ?
            <Image
              src={siteConfig.brand.logoMark}
              alt=""
              width={56}
              height={56}
              className="mx-auto mb-3 size-14 object-contain"
            />
          : null}
          {code ?
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[color:var(--mc-accent)] uppercase">
              {code}
            </p>
          : null}
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <div
            className="mx-auto mt-4 h-1 w-12 rounded-full bg-[color:var(--mc-accent)]"
            aria-hidden
          />
        </div>
        <div className="px-6 py-8">
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
          {children ?
            <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
              {children}
            </div>
          : null}
        </div>
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
