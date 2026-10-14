import { cache, Suspense } from "react";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import type { CoachProfile } from "@/types/coach";

import { ProfileEnquiryPanel } from "@/components/coach-profile/profile-enquiry-panel";
import { ProfileEvents } from "@/components/coach-profile/profile-events";
import { ProfileExpertise } from "@/components/coach-profile/profile-expertise";
import { ProfileHero } from "@/components/coach-profile/profile-hero";
import { ProfilePackages } from "@/components/coach-profile/profile-packages";
import { ProfileStats } from "@/components/coach-profile/profile-stats";
import { CoachProfileSkeleton } from "@/components/skeletons/coach-profile-skeleton";
import { siteConfig } from "@/config/site";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";
import { getUpcomingCoachEvents } from "@/lib/coach/events";
import { publicEventCutoffMs } from "@/lib/coach/public-event-cutoff";
import { buildPublicProfileStats } from "@/lib/coach/public-stats";
import {
  buildEnquiryLookingForOptions,
  splitServiceNames,
} from "@/lib/coach/services";
import { whatsAppUrlFromMobile } from "@/lib/coach/whatsapp";
import { resolveMediaUrl } from "@/lib/media/media-url";

type Params = Promise<{ code: string }>;

const loadCoach = cache(async function loadCoach(
  code: string,
): Promise<CoachProfile | null> {
  const asId = Number(code);
  const response = await fetchCoachProfile(
    Number.isFinite(asId) && asId > 0 && String(asId) === code ?
      { coachId: asId }
    : { coachCode: code },
  );
  if (!isApiSuccess(response) || !response.responseObj) return null;
  return response.responseObj;
});

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
  return unique.join(", ");
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
      siteConfig.brand.logoMark;
    const category = coach.coachTypeName?.trim();
    const city = coach.city_Cd?.trim();
    const description =
      coach.tagline?.trim() ||
      coach.coachDesc?.trim()?.slice(0, 160) ||
      [coach.coachName, category, city ? `in ${city}` : null, "on Mera Coach"]
        .filter(Boolean)
        .join(" · ");
    const titleParts = [coach.coachName, category].filter(Boolean);
    const canonicalCode = coach.coachCode || code;
    return {
      title: titleParts.join(" · "),
      description,
      alternates: {
        canonical: `/coach/${encodeURIComponent(canonicalCode)}`,
      },
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
    <>
      <Suspense fallback={<CoachProfileSkeleton />}>
        <ProfileTop params={params} />
      </Suspense>
      <HowICoach />
      <Suspense fallback={null}>
        <ProfileBottom params={params} />
      </Suspense>
    </>
  );
}

async function ProfileTop({ params }: { params: Params }) {
  const coach = await loadCoachOrNull(params);
  if (!coach) notFound();
  const view = profileView(coach);
  return (
    <>
      <ProfileHero
        coach={coach}
        whatsappUrl={view.whatsappUrl}
        locationLabel={view.locationLabel}
      />
      <ProfileStats stats={view.stats} />
      <section className="bg-paper py-14 sm:py-16">
        <div className="container">
          <ProfileExpertise tags={view.tags} coachType={coach.coachTypeName} />
        </div>
      </section>
      <ProfileEnquiryPanel
        coachCode={coach.coachCode}
        coachName={coach.coachName}
        lookingForOptions={view.lookingForOptions}
      />
    </>
  );
}

async function ProfileBottom({ params }: { params: Params }) {
  const coach = await loadCoachOrNull(params);
  if (!coach) return null;
  const packages = coach.packages ?? [];
  const events = getUpcomingCoachEvents(
    coach.events ?? [],
    await publicEventCutoffMs(),
  );
  const firstName = coach.coachName.trim().split(/\s+/)[0] || coach.coachName;
  const hasExtras = packages.length > 0 || events.length > 0;
  return (
    <>
      {hasExtras ?
        <section className="bg-paper py-14 sm:py-16">
          <div className="container space-y-12">
            <ProfilePackages packages={packages} coachName={firstName} />
            <ProfileEvents events={events} />
          </div>
        </section>
      : null}
    </>
  );
}

async function loadCoachOrNull(params: Params) {
  const { code } = await params;
  try {
    return await loadCoach(code);
  } catch {
    return null;
  }
}

function profileView(coach: CoachProfile) {
  const tags = splitServiceNames(coach.serviceNames);
  const packages = coach.packages ?? [];
  const whatsappUrl = whatsAppUrlFromMobile(coach.mobile);
  const locationLabel = buildLocationLabel(coach);
  const stats = buildPublicProfileStats({
    clientCount: coach.happyClientCount,
    experience: coach.experienceYears ?? 0,
    servicesCount: tags.length,
    rating: coach.rating ?? 0,
    reviews: coach.reviewCount ?? 0,
    certificationCount: coach.certificationCount,
  });
  const lookingForOptions = buildEnquiryLookingForOptions({
    packageNames: packages.map((item) => item.name),
    serviceNames: coach.serviceNames,
  });
  return {
    tags,
    whatsappUrl,
    locationLabel,
    stats,
    lookingForOptions,
  };
}

const processSteps = [
  {
    n: "01",
    title: "Free discovery call",
    body: "A first conversation about the goal, the week, and what has already been tried.",
  },
  {
    n: "02",
    title: "Personalised plan",
    body: "A programme built around the body, the schedule, and the target.",
  },
  {
    n: "03",
    title: "Execute and adjust",
    body: "Follow the plan with check-ins so it changes when life does.",
  },
  {
    n: "04",
    title: "Celebrate and level up",
    body: "Mark what changed, then set the next target together.",
  },
] as const;

function HowICoach() {
  return (
    <section
      id="process"
      className="bg-[color:var(--paper-elevated)] py-16 sm:py-20"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border border-mc-secondary/20 bg-mc-secondary-light px-3 py-1 font-display text-xs font-bold text-mc-secondary">
            My process
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            How I coach you
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            A four-step shape coaches on Mera Coach use. The details live in the
            enquiry.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step) => (
            <li
              key={step.n}
              className="rounded-[20px] border border-line bg-white p-5 shadow-[0_8px_24px_rgba(44,24,16,0.05)]"
            >
              <span className="font-display text-2xl font-extrabold text-[color:var(--mc-accent)]">
                {step.n}
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
