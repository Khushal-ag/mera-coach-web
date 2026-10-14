import { PracticePageHeader } from "@/components/practice/page-header";

function FieldBone() {
  return (
    <div className="min-w-0">
      <div className="mc-skeleton h-3 w-16" />
      <div className="mc-skeleton mt-2 h-4 w-28 max-w-full" />
    </div>
  );
}

function SectionBone({
  titleWidth,
  fields,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  titleWidth: string;
  fields: number;
  columns?: string;
}) {
  return (
    <section className="mc-panel px-5 py-5 sm:px-6">
      <div className={`mc-skeleton h-6 ${titleWidth}`} />
      <div
        className={`mt-4 grid gap-x-6 gap-y-5 border-t border-line pt-4 ${columns}`}
      >
        {Array.from({ length: fields }, (_, index) => (
          <FieldBone key={index} />
        ))}
      </div>
    </section>
  );
}

function BmiPanel({ fields = 5 }: { fields?: number }) {
  return (
    <section className="mc-panel">
      <div className="grid lg:grid-cols-[minmax(0,16rem)_1fr]">
        <div className="bg-mc-secondary px-5 py-6 sm:px-6">
          <div className="mc-skeleton-on-dark mc-skeleton h-4 w-10" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-12 w-24" />
          <div className="mc-skeleton-on-dark mc-skeleton mt-3 h-4 w-28" />
        </div>
        <div className="px-5 py-5 sm:px-6">
          <div className="mc-skeleton h-6 w-32" />
          <div className="mt-4 grid gap-x-6 gap-y-5 border-t border-line pt-4 sm:grid-cols-2">
            {Array.from({ length: fields }, (_, index) => (
              <FieldBone key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Overview tab: contact, body metrics, lifestyle, notes, and photos. */
export function ClientProfileSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading client">
      <span className="sr-only">Loading client</span>
      <SectionBone titleWidth="w-24" fields={6} />
      <BmiPanel />
      <SectionBone titleWidth="w-24" fields={6} />
      <SectionBone titleWidth="w-32" fields={3} />
      <section className="mc-panel">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="mc-skeleton h-6 w-36" />
          <div className="mc-skeleton h-11 w-28 rounded-[10px]" />
        </div>
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="mc-skeleton aspect-square" />
          ))}
        </div>
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
      <div className="mb-6 flex flex-wrap items-center gap-3" aria-hidden>
        {CLIENT_TABS.map((width, index) => (
          <div
            key={index}
            className={`mc-skeleton h-11 rounded-[10px] ${width}`}
          />
        ))}
      </div>
      <ClientProfileSkeleton />
    </div>
  );
}

/** Checkup wizard: step pills and the identity form block. */
export function ClientCheckupSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading checkup">
      <span className="sr-only">Loading checkup</span>
      <ol className="mb-6 flex flex-wrap gap-2">
        {["w-20", "w-24", "w-16", "w-12"].map((width, index) => (
          <li key={index} className={`mc-skeleton h-7 rounded-full ${width}`} />
        ))}
      </ol>
      <div className="mc-panel">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <div className="mc-skeleton h-6 w-24" />
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <FieldInput />
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldInput />
            <FieldInput />
            <FieldInput />
            <FieldInput />
          </div>
          <FieldInput />
          <div className="mc-skeleton h-11 w-28 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

function FieldInput() {
  return (
    <div>
      <div className="mc-skeleton mb-1.5 h-3 w-24" />
      <div className="mc-skeleton h-11 w-full rounded-[10px]" />
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

/** BMI report: forest score plus the metrics grid. */
export function ClientBmiSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading BMI report">
      <span className="sr-only">Loading BMI report</span>
      <BmiPanel fields={6} />
    </div>
  );
}
