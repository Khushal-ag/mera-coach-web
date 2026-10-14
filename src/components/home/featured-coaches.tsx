import Link from "next/link";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachDirectoryCard } from "@/components/coach-directory-card";
import { SnapRow } from "@/components/home/snap-row";
import { CoachCardSkeleton } from "@/components/skeletons/coach-card-skeleton";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";

export async function FeaturedCoaches() {
  let coaches: CoachPublicListItem[] = [];
  try {
    const listRes = await fetchPublicCoaches({
      sortBy: "rating",
      page: 1,
      pageSize: 9,
    });
    if (isApiSuccess(listRes)) {
      coaches = listRes.responseObj?.items ?? [];
    }
  } catch {
    coaches = [];
  }

  return (
    <>
      <section id="coaches" className="bg-paper py-16 sm:py-20">
        <div className="container">
          <SectionIntro
            tag="Featured coaches"
            title="Meet our top rated coaches"
            subtitle="Public profiles you can open, compare, and enquire with."
          />
          {coaches.length > 0 ?
            <SnapRow label="coaches">
              {coaches.map((coach) => (
                <div
                  key={coach.coachId}
                  className="w-[min(100%,20rem)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                >
                  <CoachDirectoryCard coach={coach} />
                </div>
              ))}
            </SnapRow>
          : <p className="mt-8 rounded-[20px] border border-dashed border-line bg-white px-6 py-10 text-sm text-ink-muted">
              Coach profiles appear here as they go public.
            </p>
          }
          <div className="mt-8 text-center">
            <Link href="/coach" className="mc-btn-secondary">
              Browse all coaches
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionIntro({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary-light px-3 py-1 font-display text-xs font-bold tracking-wide text-mc-secondary">
        {tag}
      </p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

export function FeaturedCoachesFallback() {
  return (
    <section
      id="coaches"
      className="bg-paper py-16 sm:py-20"
      aria-busy="true"
      aria-label="Loading coaches"
    >
      <div className="container">
        <SectionIntro
          tag="Featured coaches"
          title="Meet our top rated coaches"
          subtitle="Public profiles you can open, compare, and enquire with."
        />
        <SnapRow label="coaches">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="w-[min(100%,20rem)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <CoachCardSkeleton />
            </div>
          ))}
        </SnapRow>
        <div className="mt-8 text-center">
          <Link href="/coach" className="mc-btn-secondary">
            Browse all coaches
          </Link>
        </div>
      </div>
    </section>
  );
}
