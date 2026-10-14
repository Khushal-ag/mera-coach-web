import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark: gradient heartbeat tile, "Mera Coach", "Wellness Platform".
 * `workspace` is the cream header. `nav` is the forest sidebar and footer.
 */
export function BrandLockup({
  variant = "nav",
  className,
}: {
  variant?: "nav" | "workspace";
  className?: string;
}) {
  const onDark = variant === "nav";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span className="inline-flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
        <Image
          src={siteConfig.brand.logoMark}
          alt=""
          width={42}
          height={42}
          className="size-full object-contain"
        />
      </span>
      <span className="min-w-0 leading-tight">
        <span
          className={cn(
            "block truncate font-display text-xl leading-none font-extrabold",
            onDark ? "text-white" : "text-ink",
          )}
        >
          Mera Coach
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate text-[11px] font-medium tracking-wide",
            onDark ? "text-white/40" : "text-ink-muted",
          )}
        >
          Wellness Platform
        </span>
      </span>
    </span>
  );
}
