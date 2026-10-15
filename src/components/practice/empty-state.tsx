import { cn } from "@/lib/utils";

/**
 * Empty screen for a tab or list: a soft icon, what is missing, why, and the
 * one action that fixes it.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "neutral" | "error";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mc-panel flex flex-col items-center px-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-16 place-items-center rounded-full text-2xl",
          tone === "error" ?
            "bg-[var(--mc-destructive-soft)] text-mc-destructive"
          : "bg-mc-secondary-light text-mc-secondary",
        )}
      >
        <i className={icon} aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-lg font-bold tracking-tight text-ink">
        {title}
      </h2>
      {description ?
        <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      : null}
      {action ?
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      : null}
    </div>
  );
}
