/** Card grid shared by the packages and events lists: image, title, two detail lines. */
function CardGridSkeleton({ cards, label }: { cards: number; label: string }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="clt-card flex min-w-0 flex-col overflow-hidden"
        >
          <div className="mc-skeleton aspect-[16/9] rounded-none" />
          <div className="grid gap-2 p-4">
            <div className="mc-skeleton h-5 w-3/4" />
            <div className="mc-skeleton h-4 w-1/2" />
            <div className="mc-skeleton h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PackageCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return <CardGridSkeleton cards={cards} label="Loading packages" />;
}

export function EventCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return <CardGridSkeleton cards={cards} label="Loading posts" />;
}
