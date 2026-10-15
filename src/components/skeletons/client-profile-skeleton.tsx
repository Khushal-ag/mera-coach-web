import { PracticePageHeader } from "@/components/practice/page-header";

function FieldBone() {
  return (
    <div className="min-w-0">
      <div className="mc-skeleton h-3 w-16" />
      <div className="mc-skeleton mt-2 h-4 w-28 max-w-full" />
    </div>
  );
}

function CardBone({
  titleWidth,
  fields,
  columns = "sm:grid-cols-2",
}: {
  titleWidth: string;
  fields: number;
  columns?: string;
}) {
  return (
    <section className="mc-panel px-5 py-5">
      <div className={`mc-skeleton h-5 ${titleWidth}`} />
      <div className={`mt-4 grid gap-x-6 gap-y-5 ${columns}`}>
        {Array.from({ length: fields }, (_, index) => (
          <FieldBone key={index} />
        ))}
      </div>
    </section>
  );
}

/** Overview tab: stat strip, then lifestyle, notes and photos beside contact and assessment. */
export function ClientProfileSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading client">
      <span className="sr-only">Loading client</span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-mc-secondary px-5 py-4">
          <div className="mc-skeleton-on-dark mc-skeleton h-3 w-10" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-9 w-16" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-2 h-3 w-20" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="mc-panel px-5 py-4">
            <div className="mc-skeleton h-3 w-14" />
            <div className="mc-skeleton mt-3 h-9 w-20" />
            <div className="mc-skeleton mt-2 h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          <CardBone
            titleWidth="w-24"
            fields={6}
            columns="sm:grid-cols-2 xl:grid-cols-3"
          />
          <CardBone
            titleWidth="w-32"
            fields={3}
            columns="sm:grid-cols-2 xl:grid-cols-3"
          />
          <section className="mc-panel">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="mc-skeleton h-6 w-36" />
              <div className="mc-skeleton h-10 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-4 sm:gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="mc-skeleton aspect-square" />
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <CardBone titleWidth="w-20" fields={3} columns="grid-cols-1" />
          <CardBone titleWidth="w-28" fields={3} columns="grid-cols-1" />
        </div>
      </div>
    </div>
  );
}

/** BMI report tab: patient header, stat cards, history table and graph. */
export function BmiReportSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading BMI report">
      <span className="sr-only">Loading BMI report</span>
      <section className="mc-panel px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="mc-skeleton size-14 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="mc-skeleton h-5 w-48 max-w-full" />
            <div className="mc-skeleton h-3 w-64 max-w-full" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <FieldBone key={index} />
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="mc-panel px-4 py-4">
            <div className="mc-skeleton h-3 w-20" />
            <div className="mc-skeleton mt-3 h-8 w-16" />
            <div className="mc-skeleton mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <section className="mc-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="mc-skeleton h-5 w-44" />
          <div className="mc-skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="mc-skeleton h-8 w-full" />
          ))}
        </div>
      </section>
      <section className="mc-panel p-5">
        <div className="mc-skeleton mb-4 h-5 w-36" />
        <div className="mc-skeleton h-48 w-full" />
      </section>
    </div>
  );
}

const CLIENT_TABS = ["w-28", "w-24", "w-16", "w-16"] as const;

/** Suspense fallback: title, back link, tabs, then the overview panels. */
export function ClientProfilePageSkeleton() {
  return (
    <div className="min-w-0">
      <PracticePageHeader
        title="Client"
        back={{ href: "/dashboard/clients", label: "Back to clients" }}
        leading={<div className="mc-skeleton size-20 rounded-full" />}
        description={
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="mc-skeleton h-8 w-28" />
            <div className="mc-skeleton h-8 w-40" />
          </div>
        }
      />
      <div
        className="mb-6 flex items-center gap-6 border-b border-line pb-3"
        aria-hidden
      >
        {CLIENT_TABS.map((width, index) => (
          <div key={index} className={`mc-skeleton h-5 ${width}`} />
        ))}
      </div>
      <ClientProfileSkeleton />
    </div>
  );
}

/** Row of the wizard form: label on the left, input on the right, like the real form. */
function WizardRow() {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_1fr] items-center gap-3">
      <div className="mc-skeleton h-4 w-20" />
      <div className="mc-skeleton h-10 w-full rounded-[10px]" />
    </div>
  );
}

const STEP_LABELS = ["w-16", "w-24", "w-20", "w-14"] as const;

/** Checkup wizard: stepper card, then the green-headed "Client Details" form card. */
export function ClientCheckupSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading checkup">
      <span className="sr-only">Loading checkup</span>
      <div className="mc-panel flex items-start px-4 py-5 sm:px-8">
        {STEP_LABELS.map((width, index) => (
          <div
            key={index}
            className={
              index < STEP_LABELS.length - 1 ?
                "flex flex-1 items-start"
              : "flex items-start"
            }
          >
            <div className="flex w-16 shrink-0 flex-col items-center gap-2 sm:w-20">
              <div className="mc-skeleton size-9 rounded-full" />
              <div className={`mc-skeleton h-3 ${width}`} />
            </div>
            {index < STEP_LABELS.length - 1 ?
              <div className="mc-skeleton mt-[17px] h-0.5 flex-1 rounded-none" />
            : null}
          </div>
        ))}
      </div>
      <section className="mc-panel overflow-hidden">
        <div className="bg-mc-secondary px-5 py-3.5">
          <div className="mc-skeleton-on-dark mc-skeleton h-5 w-32" />
        </div>
        <div className="grid gap-x-8 gap-y-5 p-5 sm:p-6 lg:grid-cols-2">
          {Array.from({ length: 9 }, (_, index) => (
            <WizardRow key={index} />
          ))}
        </div>
        <div className="border-t border-line px-5 py-4 sm:px-6">
          <div className="mc-skeleton h-11 w-40 rounded-full" />
        </div>
      </section>
    </div>
  );
}

/** Diet plan: daily target, side stats, and meal rows. */
export function ClientDietSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading diet plan">
      <span className="sr-only">Loading diet plan</span>
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.7fr)]">
        <div className="flex min-h-[10rem] flex-col justify-between rounded-2xl bg-mc-secondary px-6 py-6">
          <div className="mc-skeleton-on-dark mc-skeleton h-4 w-24" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-14 w-28" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-4 w-12" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="mc-panel px-5 py-4">
            <div className="mc-skeleton h-4 w-24" />
            <div className="mc-skeleton mt-2 h-7 w-20" />
          </div>
          <div className="mc-panel px-5 py-4">
            <div className="mc-skeleton h-4 w-12" />
            <div className="mc-skeleton mt-2 h-7 w-16" />
          </div>
        </div>
      </div>
      <div className="mc-skeleton h-6 w-16" />
      <ul className="mc-roster divide-y divide-line">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="mc-skeleton h-5 w-24" />
              <div className="mc-skeleton h-3 w-28" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="mc-skeleton h-4 w-full max-w-md" />
              <div className="mc-skeleton h-4 w-4/5 max-w-sm" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Loading rows for the coach tables (clients, leads, check-ups due). */
export function TableSkeletonRows({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  const widths = [
    "w-6",
    "w-28",
    "w-20",
    "w-24",
    "w-16",
    "w-24",
    "w-14",
    "w-20",
  ];
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden>
          {Array.from({ length: columns }, (_, col) => (
            <td key={col}>
              <div
                className={`mc-skeleton h-4 ${widths[(col + row) % widths.length]}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
