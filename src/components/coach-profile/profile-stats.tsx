import type { PublicStatItem } from "@/lib/coach/public-stats";

export function ProfileStats({ stats }: { stats: PublicStatItem[] }) {
  if (!stats.length) return null;

  const items = stats.slice(0, 4);
  const count = items.length;

  const gridClass =
    count === 4 ? "grid-cols-2 sm:grid-cols-4"
    : count === 3 ? "grid-cols-3"
    : count === 2 ? "grid-cols-2"
    : "grid-cols-1";

  return (
    <div className="border-y border-[color:var(--mc-secondary)]/15 bg-[color:var(--mc-secondary)]/12">
      <div className={`container grid gap-px ${gridClass}`}>
        {items.map((stat) => (
          <div
            key={stat.key}
            className="flex flex-col items-center justify-center bg-surface px-3 py-5 text-center sm:py-6"
          >
            <p className="font-display text-2xl font-bold tracking-tight text-mc-accent-ink sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-mc-secondary uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
