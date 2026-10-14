function rowsOf(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

/** Clients roster. `recent` drops the last-checkup column used on the full list. */
export function ClientsTableSkeleton({
  rows = 6,
  variant = "full",
}: {
  rows?: number;
  variant?: "full" | "recent";
}) {
  const showCheckup = variant === "full";
  return (
    <div aria-busy="true" aria-label="Loading clients">
      <span className="sr-only">Loading clients</span>
      <div className="mc-roster hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="mc-roster-head">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Age
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {showCheckup ?
                <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                  Last checkup
                </th>
              : null}
              <th className="sr-only px-4 py-3 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rowsOf(rows).map((row) => (
              <tr key={row}>
                <td className="px-4 py-3">
                  <div className="mc-skeleton h-4 w-36" />
                </td>
                <td className="px-4 py-3">
                  <div className="mc-skeleton h-4 w-24" />
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <div className="mc-skeleton h-4 w-8" />
                </td>
                <td className="px-4 py-3">
                  <div className="mc-skeleton h-5 w-16 rounded-full" />
                </td>
                {showCheckup ?
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <div className="mc-skeleton h-4 w-20" />
                  </td>
                : null}
                <td className="px-4 py-3 text-right">
                  <div className="mc-skeleton ml-auto h-4 w-10" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mc-roster divide-y divide-line md:hidden">
        {rowsOf(rows).map((row) => (
          <li
            key={row}
            className="flex items-start justify-between gap-3 px-4 py-3.5"
          >
            <div className="min-w-0 space-y-2">
              <div className="mc-skeleton h-4 w-36" />
              <div className="mc-skeleton h-3.5 w-48 max-w-full" />
            </div>
            <div className="mc-skeleton h-5 w-14 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Checkups due. Dashboard uses a table from the `md` breakpoint. */
export function CheckupListSkeleton({
  rows = 5,
  layout = "list",
}: {
  rows?: number;
  layout?: "list" | "dashboard";
}) {
  return (
    <div aria-busy="true" aria-label="Loading checkups">
      <span className="sr-only">Loading checkups</span>
      <ul
        className={
          layout === "dashboard" ?
            "mc-roster divide-y divide-line md:hidden"
          : "mc-roster divide-y divide-line"
        }
      >
        {rowsOf(rows).map((row) => (
          <li
            key={row}
            className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-2">
              <div className="mc-skeleton h-4 w-36" />
              <div className="mc-skeleton h-3 w-44 max-w-full" />
              <div className="mc-skeleton h-4 w-24" />
            </div>
            <div className="mc-skeleton h-4 w-28" />
          </li>
        ))}
      </ul>
      {layout === "dashboard" ?
        <div className="mc-roster hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="mc-roster-head">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Client</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="sr-only px-4 py-2.5 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rowsOf(rows).map((row) => (
                <tr key={row}>
                  <td className="px-4 py-3">
                    <div className="mc-skeleton h-4 w-36" />
                    <div className="mc-skeleton mt-2 h-3 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="mc-skeleton h-4 w-20" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="mc-skeleton ml-auto h-4 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      : null}
    </div>
  );
}

/** Leads. `compact` is the dashboard preview; `cards` is the leads page. */
export function LeadListSkeleton({
  rows = 5,
  layout = "cards",
}: {
  rows?: number;
  layout?: "cards" | "compact";
}) {
  if (layout === "compact") {
    return (
      <div aria-busy="true" aria-label="Loading leads">
        <span className="sr-only">Loading leads</span>
        <ul className="mc-roster divide-y divide-line">
          {rowsOf(rows).map((row) => (
            <li
              key={row}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 space-y-2">
                <div className="mc-skeleton h-4 w-36" />
                <div className="mc-skeleton h-3 w-48 max-w-full" />
              </div>
              <div className="mc-skeleton size-4 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="mc-panel" aria-busy="true" aria-label="Loading leads">
      <span className="sr-only">Loading leads</span>
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div className="mc-skeleton h-6 w-24" />
        <div className="mc-skeleton h-4 w-20" />
      </div>
      <ul className="divide-y divide-line">
        {rowsOf(rows).map((row) => (
          <li key={row} className="px-4 py-4 sm:px-[22px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="mc-skeleton h-5 w-40" />
                <div className="mc-skeleton h-3 w-48" />
              </div>
              <div className="mc-skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="mc-skeleton h-4 w-32" />
              <div className="mc-skeleton h-4 w-48 max-w-full" />
            </div>
            <div className="mt-3">
              <div className="mc-skeleton mb-1.5 h-3 w-24" />
              <div className="mc-skeleton h-[4.5rem] w-full rounded-[10px]" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
