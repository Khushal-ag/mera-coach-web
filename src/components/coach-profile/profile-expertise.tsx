import { Medal } from "lucide-react";

import { SectionHeading } from "@/components/coach-profile/section-heading";

export function ProfileExpertise({
  tags,
  coachType,
}: {
  tags: string[];
  coachType?: string | null;
}) {
  const items =
    tags.length > 0 ? tags
    : coachType?.trim() ? [coachType.trim()]
    : [];

  return (
    <section id="expertise">
      <SectionHeading title="What I specialise in">
        {items.length > 0 ?
          "Areas listed on this coach's profile."
        : "This coach has not listed services yet."}
      </SectionHeading>
      {items.length > 0 ?
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tag) => (
            <li
              key={tag}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-mc-secondary-light text-mc-secondary">
                <Medal className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-display text-base font-bold text-ink">
                {tag}
              </h3>
            </li>
          ))}
        </ul>
      : null}
    </section>
  );
}
