/** Public coach page: hero, stats, expertise, and the enquiry card. */
export function CoachProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading coach profile">
      <section className="relative overflow-hidden bg-[image:var(--mc-gradient)] text-white">
        <div className="container py-10 sm:py-14 lg:pt-28">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
            <div className="grid gap-4">
              <div className="mc-skeleton-on-dark mc-skeleton h-72 rounded-[28px] sm:h-96" />
              <div className="mc-skeleton h-11 w-full rounded-full" />
              <div className="mc-skeleton-on-dark mc-skeleton h-11 w-full rounded-full" />
              <div className="mc-skeleton-on-dark mc-skeleton h-11 w-full rounded-full" />
            </div>
            <div className="min-w-0 lg:pt-4">
              <div className="flex gap-2">
                <div className="mc-skeleton-on-dark mc-skeleton h-7 w-40 rounded-full" />
                <div className="mc-skeleton-on-dark mc-skeleton h-7 w-28 rounded-full" />
              </div>
              <div className="mc-skeleton-on-dark mc-skeleton mt-4 h-12 w-72 max-w-full" />
              <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-6 w-56 max-w-full" />
              <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-4 w-44" />
              <div className="mt-5 max-w-xl space-y-2">
                <div className="mc-skeleton-on-dark mc-skeleton h-4 w-full" />
                <div className="mc-skeleton-on-dark mc-skeleton h-4 w-11/12" />
                <div className="mc-skeleton-on-dark mc-skeleton h-4 w-2/3" />
              </div>
              <div className="mt-6 flex gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="mc-skeleton-on-dark mc-skeleton size-10 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-mc-secondary">
        <div className="container flex flex-wrap items-center justify-around gap-6 py-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="min-w-28 text-center">
              <div className="mc-skeleton-on-dark mc-skeleton mx-auto h-10 w-16" />
              <div className="mc-skeleton-on-dark mc-skeleton mx-auto mt-2 h-3.5 w-20" />
            </div>
          ))}
        </div>
      </div>

      <section className="bg-paper py-14 sm:py-16">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <div className="mc-skeleton mx-auto h-6 w-40 rounded-full" />
            <div className="mc-skeleton mx-auto mt-3 h-8 w-64 max-w-full" />
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
                >
                  <div className="mc-skeleton size-11 rounded-xl" />
                  <div className="mc-skeleton mt-3 h-5 w-2/3" />
                  <div className="mc-skeleton mt-2 h-3 w-full" />
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-4">
            <div className="mc-skeleton h-40 rounded-2xl" />
            <div className="mc-skeleton h-56 rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="bg-[image:var(--mc-gradient)] py-16 sm:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl rounded-[24px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="mc-skeleton h-6 w-28 rounded-full" />
            <div className="mc-skeleton mt-3 h-9 w-72 max-w-full" />
            <div className="mc-skeleton mt-2 h-4 w-80 max-w-full" />
            <div className="mt-6 space-y-4">
              <FieldBlock />
              <FieldBlock />
              <FieldBlock />
              <div>
                <div className="mc-skeleton mb-1.5 h-3 w-28" />
                <div className="mc-skeleton h-20 w-full rounded-[10px]" />
              </div>
              <div className="mc-skeleton h-11 w-full rounded-full" />
            </div>
            <div className="mt-5 flex flex-wrap gap-4 border-t border-line pt-4">
              <div className="mc-skeleton h-3 w-20" />
              <div className="mc-skeleton h-3 w-32" />
              <div className="mc-skeleton h-3 w-36" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FieldBlock() {
  return (
    <div>
      <div className="mc-skeleton mb-1.5 h-3 w-20" />
      <div className="mc-skeleton h-11 w-full rounded-[10px]" />
    </div>
  );
}
