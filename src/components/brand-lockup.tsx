import { HeartPulse } from "lucide-react";

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
      <span className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-[image:var(--mc-gradient)] text-white">
        <HeartPulse className="size-5" strokeWidth={2.25} aria-hidden />
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
