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
import { listPublicCoachGallery } from "@/lib/api/document";
import {
  formatEventDateLabel,
  getUpcomingCoachEvents,
} from "@/lib/coach/events";
import { publicEventCutoffMs } from "@/lib/coach/public-event-cutoff";
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

function coachDescription(coach: {
  coachName?: string | null;
  coachTypeName?: string | null;
  city_Cd?: string | null;
  tagline?: string | null;
  coachDesc?: string | null;
  experienceYears?: number | null;
}) {
  const category = coach.coachTypeName?.trim();
  const city = coach.city_Cd?.trim();
  const lead = [
    coach.coachName,
    category ? `is a ${category.toLowerCase()}` : "is a coach",
    city ? `based in ${city}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const about = (coach.coachDesc ?? "").replace(/\s+/g, " ").trim();
  const text =
    about.length > 40 ?
      about
    : [lead + ".", coach.tagline?.trim()].filter(Boolean).join(" ");
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}...` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  try {
    const coach = await loadCoach(code);
    if (!coach) {
      return { title: "Coach not found", robots: { index: false } };
    }
    const category = coach.coachTypeName?.trim();
    const city = coach.city_Cd?.trim();
    const description = coachDescription(coach);
    const title =
      category ?
        `${coach.coachName}, ${category}${city ? ` in ${city}` : ""} | Mera Coach`
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
      },
      twitter: {
        card: "summary_large_image",
        title: coach.coachName,
        description,
      },
    };
  } catch {
    return { title: "Coach", robots: { index: false } };
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
  const [cutoff, gallery] = await Promise.all([
    publicEventCutoffMs(),
    listPublicCoachGallery(coach.coachCode).catch(() => []),
  ]);
  const url = `${siteConfig.url}/coach/${encodeURIComponent(coach.coachCode || "")}`;
  const photo = resolveMediaUrl(coach.profile_Pic_Url || coach.logo_Url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        url,
        mainEntity: {
          "@type": "Person",
          name: coach.coachName,
          jobTitle: coach.coachTypeName || "Coach",
          description: coachDescription(coach),
          url,
          ...(photo ? { image: photo } : {}),
          ...(coach.city_Cd ?
            {
              address: {
                "@type": "PostalAddress",
                addressLocality: coach.city_Cd,
                ...(coach.state_Cd ? { addressRegion: coach.state_Cd } : {}),
                ...(coach.country_Cd ?
                  { addressCountry: coach.country_Cd }
                : {}),
              },
            }
          : {}),
          worksFor: { "@type": "Organization", name: siteConfig.name },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Find a Coach",
            item: `${siteConfig.url}/coach`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: coach.coachName,
            item: url,
          },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CoachProfileView
        coach={toProfileDetails(coach, {
          cutoff,
          gallery: gallery.map((photo) => ({
            id: String(photo.docId),
            src: resolveMediaUrl(photo.filePath),
          })),
        })}
      />
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

function httpUrl(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

function toProfileDetails(
  coach: CoachProfile,
  extras: {
    cutoff: number;
    gallery: { id: string; src: string }[];
  },
) {
  const packages = (coach.packages ?? []).map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    duration: pkg.duration,
    description: pkg.description,
    imageSrc: resolveMediaUrl(pkg.imageUrl) || "",
  }));
  const events = getUpcomingCoachEvents(coach.events ?? [], extras.cutoff).map(
    (evt) => {
      const when = [formatEventDateLabel(evt.date), evt.time.trim()]
        .filter(Boolean)
        .join(" · ");
      return {
        id: evt.id,
        title: evt.title,
        when,
        location: evt.location,
        href: httpUrl(evt.link),
        imageSrc: resolveMediaUrl(evt.imageUrl) || "",
      };
    },
  );
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
    reviews: coach.reviewCount ?? 0,
    photoSrc: resolveMediaUrl(coach.profile_Pic_Url) || "",
    coverSrc: resolveMediaUrl(coach.cover_Url) || "",
    whatsappUrl: whatsAppUrlFromMobile(coach.mobile) ?? "#",
    packages,
    events,
    gallery: extras.gallery.filter((photo) => photo.src),
  };
}
