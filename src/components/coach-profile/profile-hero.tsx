import Link from "next/link";

import type { CoachProfile } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";
import { resolveCoachPhotoUrl } from "@/lib/media/media-url";

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
  const category = coach.coachTypeName?.trim() || "Health & Wellness Coach";
  const tagline = coach.tagline?.trim();
  const business = coach.businessName?.trim();
  const showRating = (coach.rating ?? 0) > 0;

  return (
    <section className="relative isolate overflow-hidden bg-[image:linear-gradient(145deg,#0f2018_0%,#1b4332_52%,#163527_100%)] text-white">
      <div
        className="pointer-events-none absolute -top-20 -right-10 size-72 rounded-full bg-white/6"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 size-40 rounded-full bg-[color:var(--mc-accent)]/20"
        aria-hidden
      />
      <div className="relative z-10 container py-8 sm:py-12 lg:py-14">
        <p className="flex flex-wrap items-center gap-y-1 text-sm text-white/70">
          <Link
            href="/coach"
            className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-accent)]"
          >
            Find a Coach
          </Link>
          <span className="mx-1.5 text-white/35" aria-hidden>
            /
          </span>
          <span className="text-white/90">{coach.coachName}</span>
        </p>

        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
          <div className="relative mx-auto size-44 sm:size-52 lg:mx-0 lg:size-60">
            <div
              className="absolute -inset-2 rounded-full border border-[color:var(--mc-accent)]/50"
              aria-hidden
            />
            <div className="relative size-full overflow-hidden rounded-full border-4 border-white/90 bg-mc-secondary shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <CoachPhoto
                src={photo}
                alt={coach.coachName}
                name={coach.coachName}
                className="object-cover object-top"
                sizes="240px"
                priority
              />
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <p className="inline-flex rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/15 px-3 py-1 font-display text-xs font-bold tracking-wide text-[color:var(--mc-accent)]">
              {category}
            </p>
            <h1 className="mt-3 font-display text-[1.85rem] leading-[1.12] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {coach.coachName}
            </h1>
            {(
              business &&
              business.toLowerCase() !== coach.coachName.toLowerCase()
            ) ?
              <p className="mt-1.5 text-sm text-white/70">{business}</p>
            : null}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/75 lg:justify-start">
              {locationLabel ?
                <span>{locationLabel}</span>
              : null}
              {showRating ?
                <span className="font-semibold text-[color:var(--mc-accent)]">
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
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0">
                {tagline}
              </p>
            : null}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start [&>a]:w-full sm:[&>a]:w-auto [&>div]:w-full sm:[&>div]:w-auto [&>div>button]:w-full sm:[&>div>button]:w-auto">
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
                  className="mc-btn-outline-on-dark min-h-11 px-5 text-sm"
                >
                  WhatsApp
                </a>
              : null}
              <ShareProfileButton
                coachName={coach.coachName}
                variant="outline-on-dark"
                className="min-h-11 px-5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
