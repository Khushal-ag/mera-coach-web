import { cache, Suspense } from "react";

import type { Metadata } from "next";

import type { CoachProfile } from "@/types/coach";

import {
  CoachProfileMissing,
  CoachProfileView,
} from "@/components/coach-profile/coach-profile";
import { CoachProfileSkeleton } from "@/components/skeletons/coach-profile-skeleton";
import { siteConfig } from "@/config/site";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";
import { splitServiceNames } from "@/lib/coach/services";
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
    const title =
      category ?
        `${coach.coachName} – ${category} | Mera Coach`
      : `${coach.coachName} | Mera Coach`;
    const canonicalCode = coach.coachCode || code;
    return {
      title: { absolute: title },
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
    <Suspense fallback={<CoachProfileSkeleton />}>
      <ProfileBody params={params} />
    </Suspense>
  );
}

async function ProfileBody({ params }: { params: Params }) {
  const coach = await loadCoachOrNull(params);
  if (!coach) return <CoachProfileMissing />;
  return <CoachProfileView coach={toProfileDetails(coach)} />;
}

async function loadCoachOrNull(params: Params) {
  const { code } = await params;
  try {
    return await loadCoach(code);
  } catch {
    return null;
  }
}

function toProfileDetails(coach: CoachProfile) {
  return {
    coachCode: coach.coachCode,
    coachName: coach.coachName?.trim() || "Coach Profile",
    coachType: coach.coachTypeName?.trim() ?? "",
    city: coach.city_Cd?.trim() ?? "",
    tagline: coach.tagline?.trim() ?? "",
    bio: coach.coachDesc?.trim() ?? "",
    services: splitServiceNames(coach.serviceNames),
    expYears: coach.experienceYears ?? 0,
    clients: coach.happyClientCount ?? 0,
    certs: coach.certificationCount ?? 0,
    rating: coach.rating ?? 0,
    photoSrc: resolveMediaUrl(coach.profile_Pic_Url) || "",
    whatsappUrl: whatsAppUrlFromMobile(coach.mobile) ?? "#",
  };
}
