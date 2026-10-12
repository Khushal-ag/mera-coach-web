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
        <div className="container py-3 sm:py-3.5">
          <p className="flex flex-wrap items-center gap-y-1 text-sm text-white/75">
            <Link
              href="/coach"
              className="inline-flex min-h-10 items-center hover:text-[color:var(--mc-brand-coach)]"
            >
              Find A Coach
            </Link>
            <span className="mx-1.5 text-white/40" aria-hidden>
              ›
            </span>
            <span className="text-white">{coach.coachName}</span>
          </p>
        </div>
      </div>

      <div className="container pt-5 pb-8 sm:pt-7 sm:pb-10 lg:pb-12">
        <div className="overflow-hidden rounded-[1.35rem] border border-[color:var(--mc-secondary)]/12 bg-surface shadow-[0_18px_44px_rgba(0,40,32,0.1)] sm:rounded-[1.75rem]">
          <div className="grid lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
            <div className="relative hidden bg-[color:var(--mc-header-bottom)] lg:block">
              <div className="relative aspect-[4/5] h-full max-h-[24rem] min-h-full">
                <CoachPhoto
                  src={photo}
                  alt={coach.coachName}
                  className="object-cover object-top"
                  sizes="272px"
                  priority
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-[color:var(--mc-header-bottom)]/20"
                  aria-hidden
                />
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-0 px-4 py-5 sm:px-8 sm:py-7 lg:px-9 lg:py-8">
              <div className="flex items-start gap-3.5 sm:gap-5 lg:block">
                <div className="relative size-[5.25rem] shrink-0 overflow-hidden rounded-2xl bg-[color:var(--mc-header-bottom)] ring-1 ring-[color:var(--mc-secondary)]/15 sm:size-[6.5rem] lg:hidden">
                  <CoachPhoto
                    src={photo}
                    alt=""
                    className="object-cover object-top"
                    sizes="104px"
                    priority
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="inline-flex max-w-full items-center rounded-full bg-mc-secondary-light px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-mc-secondary-dark uppercase sm:px-3 sm:text-[11px]">
                    <span className="truncate">{category}</span>
                  </p>

                  <h1 className="mt-2 font-display text-[1.6rem] leading-[1.15] font-bold tracking-tight text-balance text-mc-accent-ink sm:mt-2.5 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.1]">
                    {coach.coachName}
                  </h1>

                  {(
                    business &&
                    business.toLowerCase() !== coach.coachName.toLowerCase()
                  ) ?
                    <p className="mt-1 text-sm font-medium text-ink-muted">
                      {business}
                    </p>
                  : null}

                  {locationLabel ?
                    <p className="mt-2 text-sm font-semibold text-mc-brand-coach sm:text-[0.95rem]">
                      {locationLabel}
                    </p>
                  : null}
                </div>
              </div>

              {tagline ?
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:mt-3.5 sm:text-base">
                  {tagline}
                </p>
              : null}

              <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap [&>a]:w-full sm:[&>a]:w-auto [&>div]:w-full sm:[&>div]:w-auto [&>div>button]:w-full sm:[&>div>button]:w-auto">
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
      </div>
    </section>
  );
}
