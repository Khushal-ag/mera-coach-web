import {
  CheckupListSkeleton,
  ClientsTableSkeleton,
  LeadListSkeleton,
} from "@/components/skeletons/table-skeleton";

export function DashboardMetricValueSkeleton() {
  return <span className="mc-skeleton mt-4 block h-10 w-16" />;
}

export function DashboardCheckupsSkeleton() {
  return <CheckupListSkeleton rows={4} layout="dashboard" />;
}

export function DashboardLeadsSkeleton() {
  return <LeadListSkeleton rows={4} layout="compact" />;
}

export function DashboardClientsSkeleton() {
  return <ClientsTableSkeleton rows={5} variant="recent" />;
}

function MetricCardSkeleton() {
  return (
    <div className="flex h-full min-h-[11.5rem] flex-col rounded-2xl border border-[#e5d5c5] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(44,24,16,0.04),0_8px_24px_rgba(27,67,50,0.06)]">
      <div className="mc-skeleton size-11 rounded-xl" />
      <div className="mc-skeleton mt-4 h-10 w-16" />
      <div className="mc-skeleton mt-3 h-4 w-24" />
      <div className="mc-skeleton mt-2 h-4 w-28" />
    </div>
  );
}

/**
 * Shown before the coach session is known. The rail and top bar stay;
 * only the main column is a stand-in for the dashboard data.
 */
export function DashboardShellSkeleton() {
  return (
    <div
      className="coach-app flex min-h-dvh bg-[#f5ede0] text-ink"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col bg-mc-secondary px-3 py-5 lg:flex">
        <div className="mc-skeleton-on-dark mc-skeleton mb-4 h-10 w-40 rounded-lg" />
        <div className="mx-2 mb-3 h-px bg-white/10" />
        <div className="flex flex-1 flex-col gap-1">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className="mc-skeleton-on-dark mc-skeleton h-11 rounded-xl"
            />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#e5d5c5] bg-[#fdf8f2]">
          <div className="flex min-h-16 items-center justify-end gap-3 px-4 sm:px-7">
            <div className="mc-skeleton size-10 rounded-full" />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 pt-8 pb-12 sm:px-7">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8 flex items-start gap-4">
              <div className="mc-skeleton size-12 rounded-2xl" />
              <div className="min-w-0 space-y-3">
                <div className="mc-skeleton h-8 w-48 max-w-full" />
                <div className="h-1 w-11 rounded-full bg-mc-brand-coach" />
                <div className="mc-skeleton h-4 w-64 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="min-h-[18rem] rounded-2xl border border-[#e5d5c5] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="mc-skeleton h-6 w-32" />
                  <div className="mc-skeleton h-4 w-16" />
                </div>
                <DashboardCheckupsSkeleton />
              </div>
              <div className="min-h-[18rem] rounded-2xl border border-[#e5d5c5] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="mc-skeleton h-6 w-28" />
                  <div className="mc-skeleton h-4 w-16" />
                </div>
                <DashboardLeadsSkeleton />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
