import Link from "next/link";

import type { CoachProfile } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { ProfileCoverImage } from "@/components/coach-profile/profile-cover-image";
import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";
import { resolveCoachPhotoUrl, resolveMediaUrl } from "@/lib/media/media-url";

type ProfileHeroProps = {
  coach: CoachProfile;
  whatsappUrl: string | null;
  locationLabel: string | null;
};

export function ProfileHero({
  coach,
  whatsappUrl,
  locationLabel,
}: ProfileHeroProps) {
  const photo = resolveCoachPhotoUrl(coach);
  const cover = resolveMediaUrl(coach.cover_Url);
  const category = coach.coachTypeName?.trim() || "Health & Wellness Coach";
  const tagline = coach.tagline?.trim();
  const business = coach.businessName?.trim();
  const showRating = (coach.rating ?? 0) > 0;

  return (
    <section className="bg-[color:var(--mc-explore-canvas)] pb-8 text-ink sm:pb-10">
      <div className="container pt-5 sm:pt-6">
        <p className="flex flex-wrap items-center gap-y-1 text-sm text-ink-muted">
          <Link
            href="/coach"
            className="inline-flex min-h-11 items-center hover:text-mc-secondary"
          >
            Find a Coach
          </Link>
          <span className="mx-1.5 text-ink-muted/50" aria-hidden>
            /
          </span>
          <span className="text-ink">{coach.coachName}</span>
        </p>
      </div>

      <div className="relative mt-3 sm:mt-4">
        <div className="relative h-40 overflow-hidden bg-[image:var(--mc-gradient)] sm:h-48 lg:h-56">
          <div
            className="pointer-events-none absolute -top-16 -right-8 size-56 rounded-full bg-white/6"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/3 size-36 rounded-full bg-[color:var(--mc-accent)]/20"
            aria-hidden
          />
          {cover ?
            <ProfileCoverImage src={cover} />
          : null}
        </div>

        <div className="relative z-10 container">
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
            <div className="relative z-10 -mt-16 size-32 shrink-0 sm:-mt-20 sm:size-40 lg:-mt-24 lg:size-44">
              <div
                className="absolute -inset-1.5 rounded-full border-2 border-[color:var(--mc-primary)]/60"
                aria-hidden
              />
              <div className="relative size-full overflow-hidden rounded-full border-4 border-[color:var(--mc-explore-canvas)] bg-mc-secondary shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                <CoachPhoto
                  src={photo}
                  alt={coach.coachName}
                  name={coach.coachName}
                  className="object-cover object-top"
                  sizes="176px"
                  priority
                />
              </div>
            </div>

            <div className="mt-4 flex min-w-0 flex-1 flex-col items-center gap-4 text-center sm:mt-5 sm:items-stretch sm:text-left lg:mt-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <div className="min-w-0">
                <p className="inline-flex rounded-full bg-[color:var(--mc-secondary-light)] px-3 py-1 font-display text-xs font-bold tracking-wide text-mc-secondary">
                  {category}
                </p>
                <h1 className="mt-2 font-display text-[1.75rem] leading-[1.12] font-extrabold tracking-tight text-balance text-ink sm:text-4xl">
                  {coach.coachName}
                </h1>
                {(
                  business &&
                  business.toLowerCase() !== coach.coachName.toLowerCase()
                ) ?
                  <p className="mt-1 text-sm text-ink-muted">{business}</p>
                : null}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-ink-muted sm:justify-start">
                  {locationLabel ?
                    <span>{locationLabel}</span>
                  : null}
                  {showRating ?
                    <span className="font-semibold text-[color:var(--mc-primary)]">
                      ★ {coach.rating?.toFixed(1)}
                      {(coach.reviewCount ?? 0) > 0 ?
                        ` · ${coach.reviewCount} reviews`
                      : ""}
                    </span>
                  : null}
                  {(coach.experienceYears ?? 0) > 0 ?
                    <span>{coach.experienceYears} years</span>
                  : null}
                </div>
                {tagline ?
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base lg:mx-0">
                    {tagline}
                  </p>
                : null}
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-start lg:shrink-0 lg:justify-end [&>a]:w-full sm:[&>a]:w-auto [&>div]:w-full sm:[&>div]:w-auto [&>div>button]:w-full sm:[&>div>button]:w-auto">
                <a
                  href="#enquiry"
                  className="mc-btn-primary min-h-11 px-5 text-sm"
                >
                  Send free enquiry
                </a>
                {whatsappUrl ?
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mc-btn-secondary min-h-11 px-5 text-sm"
                  >
                    WhatsApp
                  </a>
                : null}
                <ShareProfileButton
                  coachName={coach.coachName}
                  variant="secondary"
                  className="min-h-11 px-5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
