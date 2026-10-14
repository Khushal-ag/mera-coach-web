/** Feedback form: coach and client names, five stars, comments, submit. */
export function FeedbackFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading feedback">
      <div className="grid gap-3 sm:grid-cols-2">
        <NameCard />
        <NameCard />
      </div>
      <div className="space-y-6 rounded-[22px] border border-line bg-white p-4 shadow-[0_16px_40px_rgba(44,24,16,0.08)] sm:p-8">
        <div className="mc-skeleton h-4 w-16" />
        <div className="grid grid-cols-5 gap-2 sm:flex sm:gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="mc-skeleton h-11 rounded-2xl sm:size-12 sm:rounded-full"
            />
          ))}
        </div>
        <div className="mc-skeleton h-4 w-28" />
        <div>
          <div className="mc-skeleton mb-1.5 h-4 w-24" />
          <div className="mc-skeleton h-36 w-full rounded-[10px]" />
          <div className="mc-skeleton mt-2 h-3 w-16" />
        </div>
        <div className="mc-skeleton h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

function NameCard() {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3.5 shadow-[0_2px_8px_rgba(44,24,16,0.04)]">
      <div className="mc-skeleton h-3 w-14" />
      <div className="mc-skeleton mt-2 h-6 w-36 max-w-full" />
    </div>
  );
}
