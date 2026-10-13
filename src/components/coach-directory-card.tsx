import Image from "next/image";
import Link from "next/link";

import { Briefcase, MapPin, Star } from "lucide-react";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { categoryScene } from "@/lib/coach/scene-art";
import { resolveCoachPhotoUrl } from "@/lib/media/media-url";

function coachHref(coach: CoachPublicListItem) {
  return coach.coachCode ?
      `/coach/${encodeURIComponent(coach.coachCode)}`
    : `/coach/${coach.coachId}`;
}

/** Compact top-rated row: avatar, name, rating, city. Not the cover card. */
export function CoachTopRatedStrip({
  coaches,
}: {
  coaches: CoachPublicListItem[];
}) {
  return (
    <ul className="mt-4 flex snap-x snap-mandatory [scrollbar-width:thin] gap-3 overflow-x-auto pb-1">
      {coaches.map((coach) => {
        const photo = resolveCoachPhotoUrl(coach);
        const showRating = coach.rating > 0;
        return (
          <li key={coach.coachId} className="snap-start">
            <Link
              href={coachHref(coach)}
              className="flex w-[16.75rem] items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(44,24,16,0.06)] transition hover:-translate-y-0.5 hover:border-mc-primary/35 hover:shadow-[0_12px_28px_rgba(44,24,16,0.1)]"
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-mc-secondary shadow-sm">
                <CoachPhoto
                  src={photo}
                  alt=""
                  name={coach.coachName}
                  className="object-cover"
                  sizes="44px"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-sm font-bold text-ink">
                  {coach.coachName}
                </span>
                <span className="mt-0.5 flex min-w-0 items-center gap-2 text-xs text-ink-muted">
                  {showRating ?
                    <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[color:var(--mc-accent)]">
                      <Star
                        className="size-3.5 fill-[color:var(--mc-accent)] text-[color:var(--mc-accent)]"
                        aria-hidden
                      />
                      {coach.rating.toFixed(1)}
                    </span>
                  : null}
                  {coach.city_Cd ?
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{coach.city_Cd}</span>
                    </span>
                  : null}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Home and directory card: cover scene, overlapping portrait, meta, tags. */
export function CoachDirectoryCard({ coach }: { coach: CoachPublicListItem }) {
  const href = coachHref(coach);
  const photo = resolveCoachPhotoUrl(coach);
  const scene = categoryScene(coach.coachTypeName || coach.coachTypeCode || "");
  const tags = (coach.serviceNames || coach.serviceCodes_Csv || "")
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
  const showRating = coach.rating > 0;
  const bio = (coach.tagline || coach.coachDesc || "").trim();
  const specialty = coach.coachTypeName || "Personal Coach";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-surface shadow-[0_8px_30px_rgba(44,24,16,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(44,24,16,0.14)]">
      <div className="relative h-36 sm:h-40">
        <Image
          src={scene.src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-1 font-display text-[11px] font-bold text-white"
          style={{ backgroundColor: scene.accent }}
        >
          {specialty}
        </span>
      </div>
      <div className="relative px-5 pt-0 pb-5">
        <div className="relative -mt-8 mb-3 size-16 overflow-hidden rounded-full border-[3px] border-white bg-mc-secondary shadow-md">
          <CoachPhoto
            src={photo}
            alt=""
            name={coach.coachName}
            className="object-cover"
            sizes="64px"
          />
        </div>
        <h3 className="truncate font-display text-lg font-bold text-ink">
          {coach.coachName}
        </h3>
        <p
          className="mt-0.5 truncate text-sm font-semibold"
          style={{ color: scene.accent }}
        >
          {specialty}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          {showRating ?
            <span className="inline-flex items-center gap-1">
              <Star
                className="size-3.5 fill-[color:var(--mc-accent)] text-[color:var(--mc-accent)]"
                aria-hidden
              />
              {coach.rating.toFixed(1)}
              {coach.reviewCount > 0 ? ` (${coach.reviewCount})` : ""}
            </span>
          : null}
          {coach.experienceYears > 0 ?
            <span className="inline-flex items-center gap-1">
              <Briefcase className="size-3.5" aria-hidden />
              {coach.experienceYears} yrs
            </span>
          : null}
          {coach.city_Cd ?
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{coach.city_Cd}</span>
            </span>
          : null}
        </div>
        {bio ?
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-muted">
            {bio}
          </p>
        : null}
        {tags.length > 0 ?
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: `${scene.accent}18`,
                  color: scene.accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        : null}
        <div className="mt-4 flex items-center justify-between gap-3">
          {coach.happyClientCount > 0 ?
            <p className="text-xs text-ink-muted">
              Clients:{" "}
              <strong className="text-ink">{coach.happyClientCount}+</strong>
            </p>
          : <span />}
          <Link href={href} className="mc-btn-primary min-h-10 px-4 text-xs">
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
