import type { CoachEvent } from "@/types/coach";

import { SectionHeading } from "@/components/coach-profile/section-heading";
import { formatEventDateLabel } from "@/lib/coach/events";

export function ProfileEvents({ events }: { events: CoachEvent[] }) {
  if (!events.length) return null;

  return (
    <section>
      <SectionHeading eyebrow="Upcoming" title="Events & sessions" />
      <ul className="space-y-3">
        {events.map((event) => {
          const when = [formatEventDateLabel(event.date), event.time.trim()]
            .filter(Boolean)
            .join(" · ");
          return (
            <li
              key={event.id}
              className="rounded-[1.1rem] border border-[color:var(--mc-secondary)]/12 bg-surface px-4 py-4 sm:px-5"
            >
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
                  className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-mc-brand-coach hover:brightness-110"
                >
                  Open details →
                </a>
              : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
