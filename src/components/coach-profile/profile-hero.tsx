import Link from "next/link";

import { MessageCircle } from "lucide-react";

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
  const bio = coach.coachDesc?.trim();
  const language = coach.localLanguage?.trim();

  return (
    <section className="relative overflow-hidden bg-[image:var(--mc-gradient)] text-white">
      <div
        className="pointer-events-none absolute -top-40 -right-24 size-[34rem] rounded-full bg-[color:var(--mc-accent)]/10"
        aria-hidden
      />
      <div className="relative z-10 container py-10 sm:py-14">
        <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/70">
          <Link href="/" className="hover:text-[color:var(--mc-accent)]">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/coach" className="hover:text-[color:var(--mc-accent)]">
            Find a Coach
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white/90">{coach.coachName}</span>
        </p>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="relative h-80 overflow-hidden rounded-[28px] bg-mc-secondary shadow-[0_32px_80px_rgba(0,0,0,0.35)] sm:h-[28rem]">
            <CoachPhoto
              src={photo}
              alt={coach.coachName}
              name={coach.coachName}
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
          </div>

          <div className="min-w-0 lg:pt-4">
            <p className="inline-flex rounded-full border border-[color:var(--mc-accent)]/40 bg-[color:var(--mc-accent)]/15 px-3 py-1 font-display text-xs font-bold text-[color:var(--mc-accent)]">
              {category}
            </p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight break-words sm:text-5xl">
              {coach.coachName}
            </h1>
            {tagline ?
              <p className="mt-3 text-lg text-[color:var(--mc-accent)]">
                {tagline}
              </p>
            : null}
            {locationLabel || language ?
              <p className="mt-2 text-sm text-white/70">
                {[locationLabel, language].filter(Boolean).join(" · ")}
              </p>
            : null}
            {bio ?
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                {bio}
              </p>
            : null}
            <div className="mt-7 flex flex-col items-start gap-1">
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <a
                  href="#contact"
                  className="mc-btn-primary mc-btn-hero min-h-11 w-full px-5 text-sm sm:w-auto"
                >
                  Book free consultation
                </a>
                {whatsappUrl ?
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mc-btn-outline-on-dark min-h-11 w-full px-4 text-sm sm:w-auto"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    WhatsApp
                  </a>
                : null}
              </div>
              <ShareProfileButton
                coachName={coach.coachName}
                variant="quiet-on-dark"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
