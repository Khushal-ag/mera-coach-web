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

/** Home card: cover scene and overlapping portrait. Listing card: photo, name, tags. */
export function CoachDirectoryCard({
  coach,
  variant = "feature",
}: {
  coach: CoachPublicListItem;
  variant?: "feature" | "listing";
}) {
  if (variant === "listing") return <ListingCard coach={coach} />;
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_2px_8px_rgba(44,24,16,0.06)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(44,24,16,0.12)]">
      <div className="relative h-44">
        <Image
          src={scene.src}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute top-3.5 left-3.5 rounded-full bg-mc-primary px-3 py-1 font-display text-xs font-semibold text-white">
          {specialty}
        </span>
      </div>
      <div className="relative px-6 pt-0 pb-6">
        <div className="relative -mt-9 mb-3 size-[72px] overflow-hidden rounded-full border-4 border-white bg-mc-secondary shadow-[0_8px_30px_rgba(44,24,16,0.1)]">
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
                className="rounded-full bg-mc-primary-light px-2.5 py-1 text-[11px] font-semibold text-mc-primary"
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

/** Find-a-coach card: portrait on top, specialty, city, tags, profile link. */
function ListingCard({ coach }: { coach: CoachPublicListItem }) {
  const href = coachHref(coach);
  const photo = resolveCoachPhotoUrl(coach);
  const tags = (coach.serviceNames || coach.serviceCodes_Csv || "")
    .split(/[,|]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
  const specialty = coach.coachTypeName || "Personal Coach";
  const bio = (coach.tagline || coach.coachDesc || "").trim();
  const showRating = coach.rating > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-transparent bg-white shadow-[0_2px_8px_rgba(44,24,16,0.06)] transition duration-300 hover:-translate-y-2 hover:border-mc-secondary hover:shadow-[0_20px_60px_rgba(44,24,16,0.12)]">
      <div className="relative h-60 bg-mc-secondary">
        <CoachPhoto
          src={photo}
          alt={coach.coachName}
          name={coach.coachName}
          className="object-cover object-top transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 30vw"
        />
        <span className="absolute top-3.5 left-3.5 z-10 rounded-full bg-mc-primary px-3 py-1 font-display text-[11px] font-bold text-white shadow-sm">
          {specialty}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <h3 className="truncate font-display text-lg font-bold text-ink">
          {coach.coachName}
        </h3>
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
                className="rounded-full bg-mc-primary-light px-2.5 py-1 text-[11px] font-semibold text-mc-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
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
