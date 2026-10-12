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

  return (
    <section className="overflow-x-clip bg-[color:var(--mc-explore-canvas)]">
      <div className="bg-[color:var(--mc-header-bottom)]">
        <div className="container py-3">
          <p className="flex flex-wrap items-center gap-y-1 text-sm text-white/75">
            <Link
              href="/coach"
              className="inline-flex min-h-10 items-center hover:text-[color:var(--mc-brand-coach)]"
            >
              Find a Coach
            </Link>
            <span className="mx-1.5 text-white/40" aria-hidden>
              ›
            </span>
            <span className="text-white">{coach.coachName}</span>
          </p>
        </div>
      </div>

      <div className="container pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pb-14">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--mc-header-bottom)] shadow-[0_20px_48px_rgba(0,40,32,0.14)] lg:mx-0 lg:max-w-none">
            <CoachPhoto
              src={photo}
              alt={coach.coachName}
              className="object-cover object-top"
              sizes="(max-width: 1024px) 320px, 320px"
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--mc-header-bottom)]/40 via-transparent to-transparent"
              aria-hidden
            />
          </div>

          <div className="min-w-0 pb-1">
            <p className="text-sm font-semibold text-mc-secondary">
              {category}
            </p>

            <h1 className="mt-2 font-display text-[1.85rem] leading-[1.12] font-bold tracking-tight text-balance text-mc-accent-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              {coach.coachName}
            </h1>

            {(
              business &&
              business.toLowerCase() !== coach.coachName.toLowerCase()
            ) ?
              <p className="mt-1.5 text-sm font-medium text-ink-muted">
                {business}
              </p>
            : null}

            {locationLabel ?
              <p className="mt-2 text-sm font-semibold text-mc-brand-coach sm:text-[0.95rem]">
                {locationLabel}
              </p>
            : null}

            {tagline ?
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                {tagline}
              </p>
            : null}

            <div
              className="mt-4 h-1 w-14 rounded-full bg-mc-brand-coach"
              aria-hidden
            />

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap [&>a]:w-full sm:[&>a]:w-auto [&>div]:w-full sm:[&>div]:w-auto [&>div>button]:w-full sm:[&>div>button]:w-auto">
              <a
                href="#enquiry"
                className="mc-btn-primary min-h-11 px-5 text-sm sm:min-h-12 sm:px-7"
              >
                Send free enquiry
              </a>
              {whatsappUrl ?
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-btn-secondary min-h-11 px-5 text-sm sm:min-h-12 sm:px-7"
                >
                  Chat on WhatsApp
                </a>
              : null}
              <ShareProfileButton
                coachName={coach.coachName}
                variant="secondary"
                className="min-h-11 px-5 text-sm sm:min-h-12 sm:px-7"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
