/** Home feature card and Find a Coach listing card. */
export function CoachCardSkeleton({
  variant = "feature",
}: {
  variant?: "feature" | "listing";
}) {
  if (variant === "listing") return <ListingCardSkeleton />;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_2px_8px_rgba(44,24,16,0.06)]">
      <div className="relative h-44">
        <div className="mc-skeleton size-full rounded-none" />
        <div className="mc-skeleton absolute top-3.5 left-3.5 h-6 w-28 rounded-full" />
      </div>
      <div className="relative px-6 pt-0 pb-6">
        <div className="mc-skeleton relative -mt-9 mb-3 size-[72px] rounded-full border-4 border-white" />
        <div className="mc-skeleton h-6 w-2/3" />
        <div className="mt-2 flex gap-3">
          <div className="mc-skeleton h-3.5 w-12" />
          <div className="mc-skeleton h-3.5 w-14" />
          <div className="mc-skeleton h-3.5 w-16" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="mc-skeleton h-4 w-full" />
          <div className="mc-skeleton h-4 w-4/5" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <div className="mc-skeleton h-6 w-16 rounded-full" />
          <div className="mc-skeleton h-6 w-20 rounded-full" />
          <div className="mc-skeleton h-6 w-14 rounded-full" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="mc-skeleton h-3.5 w-20" />
          <div className="mc-skeleton h-10 w-28 rounded-[10px]" />
        </div>
      </div>
    </article>
  );
}

function ListingCardSkeleton() {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-transparent bg-white shadow-[0_2px_8px_rgba(44,24,16,0.06)]">
      <div className="relative h-60 bg-mc-secondary">
        <div className="mc-skeleton-on-dark mc-skeleton size-full rounded-none" />
        <div className="mc-skeleton absolute top-3.5 left-3.5 z-10 h-6 w-28 rounded-full" />
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="mc-skeleton h-6 w-2/3" />
        <div className="mt-2 flex gap-3">
          <div className="mc-skeleton h-3.5 w-12" />
          <div className="mc-skeleton h-3.5 w-14" />
          <div className="mc-skeleton h-3.5 w-16" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="mc-skeleton h-4 w-full" />
          <div className="mc-skeleton h-4 w-4/5" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <div className="mc-skeleton h-6 w-16 rounded-full" />
          <div className="mc-skeleton h-6 w-20 rounded-full" />
          <div className="mc-skeleton h-6 w-14 rounded-full" />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="mc-skeleton h-3.5 w-20" />
          <div className="mc-skeleton h-10 w-28 rounded-[10px]" />
        </div>
      </div>
    </article>
  );
}

const CHIP_WIDTHS = ["w-24", "w-28", "w-20", "w-32", "w-24"] as const;

/** Category pills under the Find a Coach banner. */
export function CoachCategoryChipSkeleton() {
  return (
    <div className="mt-6 flex max-w-4xl flex-wrap gap-2" aria-hidden>
      {CHIP_WIDTHS.map((width, index) => (
        <div
          key={index}
          className={`mc-skeleton-on-dark mc-skeleton h-10 rounded-full ${width}`}
        />
      ))}
    </div>
  );
}

export function CoachDirectorySearchSkeleton() {
  return (
    <div
      className="flex min-h-14 overflow-hidden rounded-2xl border-2 border-mc-secondary bg-white"
      aria-hidden
    >
      <div className="flex flex-1 items-center px-4">
        <div className="mc-skeleton h-4 w-64 max-w-full" />
      </div>
      <div className="w-28 shrink-0 bg-mc-secondary" />
    </div>
  );
}

/** Result count plus the two-column listing grid. */
export function CoachDirectoryGridSkeleton() {
  return (
    <div className="mt-4" aria-busy="true" aria-label="Loading coaches">
      <div className="mc-skeleton h-5 w-48" />
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <CoachCardSkeleton key={index} variant="listing" />
        ))}
      </div>
    </div>
  );
}

export function CoachDirectoryFiltersSkeleton() {
  return (
    <div
      className="rounded-[20px] border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.06)]"
      aria-hidden
    >
      <div className="mc-skeleton h-5 w-16" />
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="mt-4">
          <div className="mc-skeleton h-3 w-16" />
          <div className="mc-skeleton mt-1.5 h-11 w-full rounded-[10px]" />
        </div>
      ))}
      <div className="mc-skeleton mt-5 h-11 w-full rounded-[10px]" />
      <div className="mc-skeleton mx-auto mt-3 h-4 w-16" />
    </div>
  );
}
