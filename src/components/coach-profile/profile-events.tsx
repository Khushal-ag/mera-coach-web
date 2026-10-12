import type { CoachEvent } from "@/types/coach";

import { SectionHeading } from "@/components/coach-profile/section-heading";
import { formatEventDateLabel } from "@/lib/coach/events";

export function ProfileEvents({ events }: { events: CoachEvent[] }) {
  if (!events.length) return null;

  return (
    <section>
      <SectionHeading title="Events & sessions" />
      <ul className="divide-y divide-[color:var(--mc-secondary)]/12 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--mc-secondary)]/12 bg-surface">
        {events.map((event) => {
          const when = [formatEventDateLabel(event.date), event.time.trim()]
            .filter(Boolean)
            .join(" · ");
          return (
            <li key={event.id} className="px-4 py-4 sm:px-5">
              <h3 className="font-display text-base font-bold text-mc-accent-ink sm:text-lg">
                {event.title}
              </h3>
              {when ?
                <p className="mt-1 text-sm font-medium text-mc-secondary">
                  {when}
                </p>
              : null}
              {event.location ?
                <p className="mt-1 text-sm text-ink-muted">{event.location}</p>
              : null}
              {event.link ?
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-mc-secondary hover:underline"
                >
                  Open details
                </a>
              : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
