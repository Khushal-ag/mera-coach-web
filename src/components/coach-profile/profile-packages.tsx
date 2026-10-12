import type { CoachPackage } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { SectionHeading } from "@/components/coach-profile/section-heading";
import { resolveMediaUrl } from "@/lib/media/media-url";

type ProfilePackagesProps = {
  packages: CoachPackage[];
  coachName: string;
};

export function ProfilePackages({ packages, coachName }: ProfilePackagesProps) {
  if (!packages.length) return null;

  return (
    <section>
      <SectionHeading title="Coaching packages">
        Choose a starting point, or tell {coachName} what you need in the
        enquiry form.
      </SectionHeading>
      <ul className="space-y-4">
        {packages.map((pkg) => {
          const image = resolveMediaUrl(pkg.imageUrl);
          return (
            <li
              key={pkg.id}
              className="overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--mc-secondary)]/12 bg-surface shadow-[0_8px_24px_rgba(17,104,92,0.05)]"
            >
              <div
                className={image ? "grid sm:grid-cols-[9.5rem_1fr]" : "grid"}
              >
                {image ?
                  <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[7.5rem]">
                    <CoachPhoto
                      src={image}
                      alt=""
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                : null}
                <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="min-w-0 font-display text-lg font-bold text-mc-accent-ink">
                      {pkg.name}
                    </h3>
                    {pkg.price ?
                      <p className="shrink-0 text-sm font-semibold whitespace-nowrap text-mc-brand-coach tabular-nums">
                        {pkg.price}
                      </p>
                    : null}
                  </div>
                  {pkg.duration ?
                    <p className="mt-1 text-xs font-medium text-mc-secondary">
                      {pkg.duration}
                    </p>
                  : null}
                  {pkg.description ?
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {pkg.description}
                    </p>
                  : null}
                  <a
                    href="#enquiry"
                    className="mt-3 inline-flex min-h-10 w-fit items-center text-sm font-semibold text-mc-secondary hover:text-mc-secondary-dark"
                  >
                    Enquire about this
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
