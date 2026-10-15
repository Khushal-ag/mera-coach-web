/** Signed-in profile view: main card and gallery beside the action cards, like the real page. */
export function ProfileViewSkeleton() {
  return (
    <div
      className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-5"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <span className="sr-only">Loading profile</span>
      <div className="grid min-w-0 gap-4">
        <section className="mc-panel overflow-hidden">
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
                <div className="mc-skeleton mt-3 h-4 w-48 max-w-full" />
              </div>
            </div>
            <div className="mt-6 grid gap-6 border-t border-line pt-6 xl:grid-cols-2 xl:gap-10">
              <div>
                <div className="mc-skeleton h-6 w-16" />
                <div className="mt-2 space-y-2">
                  <div className="mc-skeleton h-4 w-full" />
                  <div className="mc-skeleton h-4 w-11/12" />
                  <div className="mc-skeleton h-4 w-2/3" />
                </div>
              </div>
              <div>
                <div className="mc-skeleton h-6 w-20" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="mc-skeleton h-8 w-24 rounded-full" />
                  <div className="mc-skeleton h-8 w-28 rounded-full" />
                  <div className="mc-skeleton h-8 w-20 rounded-full" />
                  <div className="mc-skeleton h-8 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mc-panel p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="mc-skeleton h-6 w-36" />
            <div className="mc-skeleton h-10 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="mc-skeleton aspect-square" />
            ))}
          </div>
        </section>
      </div>
      <aside className="grid gap-4">
        <section className="mc-panel p-4 sm:p-5">
          <div className="mc-skeleton mb-3 h-5 w-32" />
          <div className="grid gap-3">
            <div className="mc-skeleton h-11 w-full rounded-full" />
            <div className="mc-skeleton h-11 w-full rounded-full" />
          </div>
          <div className="mc-skeleton mt-3 h-4 w-36" />
        </section>
        <section className="mc-panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="mc-skeleton h-5 w-28" />
            <div className="mc-skeleton h-7 w-20 rounded-full" />
          </div>
          <div className="mc-skeleton mt-4 h-10 w-full rounded-full" />
        </section>
        <section className="mc-panel p-3">
          <div className="mc-skeleton mb-2 ml-2 h-5 w-20" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex h-11 items-center gap-3 px-2">
              <div className="mc-skeleton size-4 rounded" />
              <div className="mc-skeleton h-4 w-32" />
            </div>
          ))}
        </section>
      </aside>
    </div>
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
