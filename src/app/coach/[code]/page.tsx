import { Suspense } from "react";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import type { CoachProfile } from "@/types/coach";

import { MobileEnquiryBar } from "@/components/coach-profile/mobile-enquiry-bar";
import { ProfileAbout } from "@/components/coach-profile/profile-about";
import { ProfileEnquiryPanel } from "@/components/coach-profile/profile-enquiry-panel";
import { ProfileEvents } from "@/components/coach-profile/profile-events";
import { ProfileExpertise } from "@/components/coach-profile/profile-expertise";
import { ProfileHero } from "@/components/coach-profile/profile-hero";
import { ProfilePackages } from "@/components/coach-profile/profile-packages";
import { ProfileStats } from "@/components/coach-profile/profile-stats";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";
import { getUpcomingCoachEvents } from "@/lib/coach/events";
import { buildPublicProfileStats } from "@/lib/coach/public-stats";
import {
  buildEnquiryLookingForOptions,
  splitServiceNames,
} from "@/lib/coach/services";
import { whatsAppUrlFromMobile } from "@/lib/coach/whatsapp";
import { COACH_PHOTO_FALLBACK, resolveMediaUrl } from "@/lib/media/media-url";

type Params = Promise<{ code: string }>;

async function loadCoach(code: string): Promise<CoachProfile | null> {
  const asId = Number(code);
  const response = await fetchCoachProfile(
    Number.isFinite(asId) && asId > 0 && String(asId) === code ?
      { coachId: asId }
    : { coachCode: code },
  );
  if (!isApiSuccess(response) || !response.responseObj) return null;
  return response.responseObj;
}

function buildLocationLabel(coach: CoachProfile): string | null {
  const parts = [
    coach.locality?.trim(),
    coach.city_Cd?.trim(),
    coach.state_Cd?.trim(),
  ].filter(Boolean);
  if (!parts.length) return null;
  // Avoid "Mumbai · Mumbai"
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.some((u) => u.toLowerCase() === part!.toLowerCase())) {
      unique.push(part!);
    }
  }
  return unique.join(" · ");
}

function buildLocationDetail(coach: CoachProfile): string | null {
  const parts = [
    coach.add_Line?.trim(),
    coach.locality?.trim(),
    [coach.city_Cd?.trim(), coach.state_Cd?.trim()].filter(Boolean).join(", "),
    coach.country_Cd?.trim(),
  ].filter(Boolean);
  if (!parts.length) return null;
  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.some((u) => u.toLowerCase() === part!.toLowerCase())) {
      unique.push(part!);
    }
  }
  return unique.join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  try {
    const coach = await loadCoach(code);
    if (!coach) return { title: "Coach" };
    const photo =
      resolveMediaUrl(coach.profile_Pic_Url || coach.logo_Url) ||
      COACH_PHOTO_FALLBACK;
    const category = coach.coachTypeName?.trim();
    const city = coach.city_Cd?.trim();
    const description =
      coach.tagline?.trim() ||
      coach.coachDesc?.trim()?.slice(0, 160) ||
      [coach.coachName, category, city ? `in ${city}` : null, "on Mera Coach"]
        .filter(Boolean)
        .join(" · ");
    const titleParts = [coach.coachName, category].filter(Boolean);
    return {
      title: titleParts.join(" · "),
      description,
      openGraph: {
        title: coach.coachName,
        description,
        type: "profile",
        images: [{ url: photo, alt: coach.coachName }],
      },
      twitter: {
        card: "summary_large_image",
        title: coach.coachName,
        description,
        images: [photo],
      },
    };
  } catch {
    return { title: "Coach" };
  }
}

export default function CoachProfilePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CoachProfileFallback />}>
      <CoachProfileBody params={params} />
    </Suspense>
  );
}

async function CoachProfileBody({ params }: { params: Params }) {
  const { code } = await params;
  let coach: CoachProfile | null = null;
  try {
    coach = await loadCoach(code);
  } catch {
    coach = null;
  }
  if (!coach) notFound();

  const tags = splitServiceNames(coach.serviceNames);
  const packages = coach.packages ?? [];
  const events = getUpcomingCoachEvents(coach.events ?? []);
  const whatsappUrl = whatsAppUrlFromMobile(coach.mobile);
  const locationLabel = buildLocationLabel(coach);
  const locationDetail = buildLocationDetail(coach);
  const stats = buildPublicProfileStats({
    clientCount: coach.happyClientCount,
    experience: coach.experienceYears ?? 0,
    servicesCount: tags.length,
    rating: coach.rating ?? 0,
    reviews: coach.reviewCount ?? 0,
    certificationCount: coach.certificationCount,
  });
  const lookingForOptions = buildEnquiryLookingForOptions({
    packageNames: packages.map((p) => p.name),
    serviceNames: coach.serviceNames,
  });
  const bio = coach.coachDesc?.trim() || null;
  const firstName = coach.coachName.trim().split(/\s+/)[0] || coach.coachName;

  return (
    <>
      <ProfileHero
        coach={coach}
        whatsappUrl={whatsappUrl}
        locationLabel={locationLabel}
      />
      <ProfileStats stats={stats} />

      <section className="bg-[color:var(--mc-explore-canvas)] pt-10 pb-28 sm:pt-12 lg:pt-14 lg:pb-16">
        <div className="container grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-start lg:gap-12">
          <div className="min-w-0 space-y-10 sm:space-y-12">
            <ProfileAbout
              coachName={firstName}
              bio={bio}
              language={coach.localLanguage?.trim() || null}
              locationDetail={locationDetail}
            />
            <ProfileExpertise tags={tags} />
            <ProfilePackages packages={packages} coachName={firstName} />
            <ProfileEvents events={events} />
          </div>

          <ProfileEnquiryPanel
            coachCode={coach.coachCode}
            coachName={coach.coachName}
            lookingForOptions={lookingForOptions}
            whatsappUrl={whatsappUrl}
          />
        </div>
      </section>

      <MobileEnquiryBar
        coachFirstName={firstName}
        coachName={coach.coachName}
        whatsappUrl={whatsappUrl}
      />
    </>
  );
}

function CoachProfileFallback() {
  return (
    <>
      <section className="bg-[color:var(--mc-explore-canvas)] pt-5 pb-8 sm:pt-7 sm:pb-10">
        <div className="container">
          <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[color:var(--mc-header-bottom)]/30" />
          <div className="overflow-hidden rounded-[1.35rem] border border-[color:var(--mc-secondary)]/12 bg-surface sm:rounded-[1.75rem]">
            <div className="grid lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
              <div className="hidden min-h-[21rem] animate-pulse bg-line lg:block" />
              <div className="flex gap-4 px-4 py-5 sm:px-8 sm:py-8">
                <div className="size-[5.5rem] shrink-0 animate-pulse rounded-2xl bg-line sm:size-[6.75rem] lg:hidden" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-5 w-36 animate-pulse rounded-full bg-line" />
                  <div className="h-8 w-48 animate-pulse rounded bg-line" />
                  <div className="h-4 w-40 animate-pulse rounded bg-line" />
                  <div className="mt-3 h-11 w-40 animate-pulse rounded-full bg-line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[color:var(--mc-explore-canvas)] py-10 sm:py-14">
        <div
          className="container space-y-4"
          aria-busy="true"
          aria-label="Loading coach profile"
        >
          <div className="h-6 w-32 animate-pulse rounded bg-line" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-line" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-line" />
        </div>
      </section>
    </>
  );
}
