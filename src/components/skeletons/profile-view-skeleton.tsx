/** Signed-in profile view: cover, portrait, about, and services. */
export function ProfileViewSkeleton() {
  return (
    <section
      className="mc-panel overflow-hidden"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>
      <div className="mc-skeleton h-40 rounded-none sm:h-48" />
      <div className="px-5 pb-6 sm:px-6">
        <div className="sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-6">
          <div className="relative z-10 -mt-12 mb-4 size-24 shrink-0 sm:-mt-16 sm:mb-0 sm:size-[7.5rem]">
            <div className="mc-skeleton size-full rounded-full border-4 border-white" />
          </div>
          <div className="min-w-0 sm:pt-5">
            <div className="mc-skeleton h-8 w-56 max-w-full" />
            <div className="mc-skeleton mt-2 h-4 w-40 max-w-full" />
            <div className="mc-skeleton mt-2 h-4 w-32 max-w-full" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="mc-skeleton h-7 w-24 rounded-full" />
              <div className="mc-skeleton h-10 w-36 rounded-[10px]" />
            </div>
          </div>
        </div>
        <div className="mc-skeleton mt-6 h-6 w-16" />
        <div className="mt-2 max-w-[65ch] space-y-2">
          <div className="mc-skeleton h-4 w-full" />
          <div className="mc-skeleton h-4 w-11/12" />
          <div className="mc-skeleton h-4 w-2/3" />
        </div>
        <div className="mc-skeleton mt-6 h-6 w-20" />
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="mc-skeleton h-8 w-24 rounded-full" />
          <div className="mc-skeleton h-8 w-28 rounded-full" />
          <div className="mc-skeleton h-8 w-20 rounded-full" />
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
          <div className="mc-skeleton h-11 w-full rounded-[10px] sm:w-36" />
          <div className="mc-skeleton h-11 w-full rounded-[10px] sm:w-40" />
        </div>
      </div>
    </section>
  );
}

function FieldBlock() {
  return (
    <div>
      <div className="mc-skeleton mb-1.5 h-3 w-28" />
      <div className="mc-skeleton h-11 w-full rounded-[10px]" />
    </div>
  );
}

/** Edit-profile form: images, identity, address grid, and the two templates. */
export function ProfileFormSkeleton() {
  return (
    <div
      className="mc-panel max-w-3xl space-y-4 p-5"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>
      <div>
        <div className="mc-skeleton mb-1.5 h-3 w-24" />
        <div className="mc-skeleton h-20 w-36 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="mc-skeleton size-24 rounded-xl" />
        <div className="mc-skeleton size-24 rounded-full" />
      </div>
      <FieldBlock />
      <FieldBlock />
      <FieldBlock />
      <div className="space-y-2">
        <div className="mc-skeleton h-3 w-20" />
        <div className="mc-skeleton h-8 w-full" />
        <div className="mc-skeleton h-8 w-4/5" />
        <div className="mc-skeleton h-8 w-3/5" />
      </div>
      <FieldBlock />
      <div>
        <div className="mc-skeleton mb-1.5 h-3 w-16" />
        <div className="mc-skeleton h-28 w-full rounded-[10px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 12 }, (_, index) => (
          <FieldBlock key={index} />
        ))}
      </div>
      <div>
        <div className="mc-skeleton mb-1.5 h-3 w-40" />
        <div className="mc-skeleton h-24 w-full rounded-[10px]" />
      </div>
      <div>
        <div className="mc-skeleton mb-1.5 h-3 w-44" />
        <div className="mc-skeleton h-24 w-full rounded-[10px]" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="mc-skeleton h-11 w-full rounded-[10px] sm:w-24" />
        <div className="mc-skeleton h-11 w-full rounded-[10px] sm:w-24" />
      </div>
    </div>
  );
}
