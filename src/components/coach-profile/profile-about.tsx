import { SectionHeading } from "@/components/coach-profile/section-heading";

type ProfileAboutProps = {
  coachName: string;
  bio: string | null;
  language: string | null;
  locationDetail: string | null;
};

export function ProfileAbout({
  coachName,
  bio,
  language,
  locationDetail,
}: ProfileAboutProps) {
  const hasMeta = Boolean(language || locationDetail);
  if (!bio && !hasMeta) return null;

  return (
    <section>
      <SectionHeading eyebrow="About" title={`Meet ${coachName}`}>
        {hasMeta ?
          [locationDetail, language ? `Languages: ${language}` : null]
            .filter(Boolean)
            .join(" · ")
        : null}
      </SectionHeading>
      {bio ?
        <p className="text-sm leading-relaxed whitespace-pre-line text-ink-muted sm:text-base">
          {bio}
        </p>
      : null}
    </section>
  );
}
