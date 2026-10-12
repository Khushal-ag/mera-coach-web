import { SectionHeading } from "@/components/coach-profile/section-heading";

export function ProfileExpertise({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <section>
      <SectionHeading title="What I specialise in" />
      <ul className="flex flex-wrap gap-2.5">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-mc-secondary-light px-3.5 py-1.5 text-sm font-medium text-mc-secondary-dark"
          >
            {tag}
          </li>
        ))}
      </ul>
    </section>
  );
}
