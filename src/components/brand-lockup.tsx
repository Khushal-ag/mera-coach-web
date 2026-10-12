import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Single brand system for the site.
 * - `nav`: mark + typed wordmark (mint/orange on dark chrome)
 * - `workspace`: mark + teal/orange wordmark for light SaaS chrome
 * - `full`: app `logo-full` asset for light / marketing surfaces
 * - `mark`: icon only when space is tight
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

  const meraClass =
    variant === "workspace" ?
      "text-[color:var(--mc-secondary)]"
    : "text-[color:var(--mc-brand-mera-on-dark)]";

  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2.5 font-display text-base font-bold tracking-tight sm:text-lg",
        className,
      )}
    >
      <Image
        src={siteConfig.brand.logoMark}
        alt=""
        width={40}
        height={40}
        className="size-9 shrink-0 object-contain sm:size-10"
        priority={priority}
      />
      <span className="truncate">
        <span className={meraClass}>Mera</span>{" "}
        <span className="text-[color:var(--mc-brand-coach)]">Coach</span>
      </span>
    </span>
  );
}
