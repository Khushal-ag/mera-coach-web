import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark from meracoachweb: "Mera Coach" plus "Wellness Platform".
 * - `workspace`: brown type on cream chrome
 * - `nav`: white type on forest or footer chrome
 * - `full` / `mark`: brand image assets
 */
export function BrandLockup({
  variant = "nav",
  className,
  priority,
}: {
  variant?: "nav" | "workspace" | "full" | "mark";
  className?: string;
  priority?: boolean;
}) {
  if (variant === "full") {
    return (
      <Image
        src={siteConfig.brand.logoFull}
        alt={siteConfig.name}
        width={1034}
        height={837}
        className={cn("h-auto w-full object-contain", className)}
        priority={priority}
      />
    );
  }

  if (variant === "mark") {
    return (
      <Image
        src={siteConfig.brand.logoMark}
        alt={siteConfig.name}
        width={560}
        height={565}
        className={cn("object-contain", className)}
        priority={priority}
      />
    );
  }

  const onDark = variant === "nav";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:size-10",
          onDark ?
            "bg-white/12 ring-1 ring-white/20"
          : "bg-[image:var(--mc-gradient)]",
        )}
      >
        <Image
          src={siteConfig.brand.logoMark}
          alt=""
          width={40}
          height={40}
          className="size-7 object-contain sm:size-8"
          priority={priority}
        />
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block truncate font-display text-base font-extrabold tracking-tight sm:text-lg",
            onDark ? "text-white" : "text-ink",
          )}
        >
          Mera Coach
        </span>
        <span
          className={cn(
            "block truncate font-sans text-[11px] font-medium tracking-wide",
            onDark ? "text-white/45" : "text-ink-muted",
          )}
        >
          Wellness Platform
        </span>
      </span>
    </span>
  );
}
