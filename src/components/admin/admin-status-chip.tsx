import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "bad" | "muted" | "accent";

const toneClass: Record<Tone, string> = {
  ok: "bg-mc-secondary-light text-mc-secondary",
  warn: "bg-amber-100 text-amber-900",
  bad: "bg-red-100 text-red-700",
  muted: "bg-[var(--cl-bg)] text-[var(--cl-text-lt)]",
  accent: "bg-[var(--cl-gold-lt)] text-[var(--cl-gold)]",
};

export function AdminStatusChip({
  tone = "muted",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-[family-name:var(--font-poppins)] text-[11px] font-bold tracking-wide whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {icon ?
        <i className={`fas ${icon}`} aria-hidden />
      : null}
      {children}
    </span>
  );
}
