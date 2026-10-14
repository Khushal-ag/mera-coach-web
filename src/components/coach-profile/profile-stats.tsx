import type { PublicStatItem } from "@/lib/coach/public-stats";

export function ProfileStats({ stats }: { stats: PublicStatItem[] }) {
  if (!stats.length) return null;

  const items = stats.slice(0, 4);

  return (
    <div className="bg-mc-secondary">
      <div className="container flex flex-wrap items-center justify-around gap-6 py-8">
        {items.map((stat) => (
          <div key={stat.key} className="min-w-28 text-center">
            <p className="font-display text-4xl leading-none font-black text-[color:var(--mc-accent)]">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[13px] text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
