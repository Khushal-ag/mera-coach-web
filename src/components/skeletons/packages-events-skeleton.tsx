function FieldBlock() {
  return (
    <div>
      <div className="mc-skeleton mb-1.5 h-3 w-24" />
      <div className="mc-skeleton h-11 w-full rounded-[10px]" />
    </div>
  );
}

function CoverBlock() {
  return (
    <div className="sm:col-span-2">
      <div className="mc-skeleton mb-1.5 h-3 w-24" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="mc-skeleton h-20 w-32 rounded-xl" />
        <div className="mc-skeleton h-11 w-24 rounded-[10px]" />
      </div>
    </div>
  );
}

/** Package editor cards: title, cover, and the four fields. */
export function PackageCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading packages">
      <span className="sr-only">Loading packages</span>
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="mc-panel min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="mc-skeleton h-6 w-40 max-w-full" />
            <div className="mc-skeleton h-4 w-16" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CoverBlock />
            <FieldBlock />
            <FieldBlock />
            <FieldBlock />
            <FieldBlock />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Event editor cards: title, cover, schedule, and link. */
export function EventCardsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading events">
      <span className="sr-only">Loading events</span>
      {Array.from({ length: cards }, (_, index) => (
        <div key={index} className="mc-panel min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="mc-skeleton h-6 w-40 max-w-full" />
            <div className="mc-skeleton h-4 w-16" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CoverBlock />
            <FieldBlock />
            <FieldBlock />
            <FieldBlock />
            <FieldBlock />
            <div className="sm:col-span-2">
              <FieldBlock />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
