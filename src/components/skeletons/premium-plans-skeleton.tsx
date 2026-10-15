/** Plan cards, promo field, and price breakdown inside the Premium checkout card. */
export function PremiumCheckoutSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading Premium plans"
    >
      <div className="flex items-center gap-3 rounded-[16px] border border-line p-3 sm:p-4">
        <div className="mc-skeleton size-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="mc-skeleton h-3 w-16" />
          <div className="mc-skeleton h-6 w-40 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-[16px] border border-line p-4 sm:p-5"
          >
            <div className="mc-skeleton h-3 w-16" />
            <div className="mc-skeleton mt-2 h-6 w-36 max-w-full" />
            <div className="mc-skeleton mt-4 h-8 w-32" />
            <div className="mc-skeleton mt-2 h-4 w-28" />
          </div>
        ))}
      </div>
      <div className="mc-skeleton h-10 w-full rounded-[12px]" />
      <div>
        <div className="mc-skeleton mb-1.5 h-3 w-20" />
        <div className="mc-skeleton h-11 w-full rounded-[10px]" />
      </div>
      <div className="rounded-[16px] border border-line p-4 sm:p-5">
        <div className="mc-skeleton h-3 w-28" />
        <div className="mt-3 space-y-2">
          <BreakdownRow />
          <BreakdownRow />
          <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
            <div className="mc-skeleton h-5 w-28" />
            <div className="mc-skeleton h-6 w-20" />
          </div>
        </div>
      </div>
      <div className="mc-skeleton h-11 w-36 rounded-[10px]" />
    </div>
  );
}

function BreakdownRow() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="mc-skeleton h-4 w-28" />
      <div className="mc-skeleton h-4 w-16" />
    </div>
  );
}

/** Right column of the Premium page, including the checkout card. */
export function PremiumPlansSkeleton() {
  return (
    <div
      className="min-w-0"
      aria-busy="true"
      aria-label="Loading Premium plans"
    >
      <div className="overflow-hidden rounded-[22px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8">
        <PremiumCheckoutSkeleton />
      </div>
      <div className="mc-skeleton mx-auto mt-6 h-4 w-72 max-w-full lg:mx-0" />
    </div>
  );
}
