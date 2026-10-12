import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import type { CoachProfile } from "@/types/coach";

import { CoachEnquiryForm } from "@/components/coach-enquiry-form";
import { fetchCoachProfile, isApiSuccess } from "@/lib/api";

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

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  try {
    const coach = await loadCoach(code);
    if (!coach) return { title: "Coach" };
    return {
      title: coach.coachName,
      description:
        coach.tagline || coach.coachDesc || `${coach.coachName} on Mera Coach`,
    };
  } catch {
    return { title: "Coach" };
  }
}

export default async function CoachProfilePage({ params }: { params: Params }) {
  const { code } = await params;
  let coach: CoachProfile | null = null;
  try {
    coach = await loadCoach(code);
  } catch {
    coach = null;
  }
  if (!coach) notFound();

  const photo =
    coach.profile_Pic_Url?.trim() ||
    coach.logo_Url?.trim() ||
    "/mc-images/services-1.jpg";

  return (
    <>
      <section className="mc-gradient-header relative overflow-x-clip py-12 text-white sm:py-16 lg:py-24">
        <div className="relative z-10 container grid items-center gap-6 text-center md:grid-cols-[200px_1fr] md:gap-8 md:text-left">
          <div className="relative mx-auto size-36 overflow-hidden rounded-full border-4 border-[color:var(--mc-brand-coach)] sm:size-44 md:mx-0">
            <Image
              src={photo}
              alt={coach.coachName}
              fill
              className="object-cover"
              sizes="176px"
              unoptimized={photo.startsWith("http")}
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center justify-center gap-y-1 text-sm text-white/70 md:justify-start">
              <Link
                href="/coach"
                className="inline-flex min-h-11 items-center hover:text-[color:var(--mc-brand-coach)]"
              >
                Find A Coach
              </Link>
              <span className="mx-1.5 text-white/40" aria-hidden>
                ›
              </span>
              <span>Profile</span>
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight break-words sm:text-4xl lg:text-5xl">
              {coach.coachName}
            </h1>
            <p className="mt-2 text-[color:var(--mc-brand-coach)]">
              {coach.coachTypeName || "Health & Wellness Coach"}
              {coach.city_Cd ? ` · ${coach.city_Cd}` : ""}
            </p>
            {coach.tagline ?
              <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
                {coach.tagline}
              </p>
            : null}
          </div>
        </div>
      </section>

      <section className="bg-paper py-10 sm:py-14 lg:py-16">
        <div className="container grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div>
              <h2 className="font-display text-2xl font-bold">About</h2>
              <div className="mt-2 h-1 w-12 bg-mc-brand-coach" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink-muted sm:text-base">
                {coach.coachDesc?.trim() ||
                  "This coach has not added a long description yet."}
              </p>
            </div>

            {(coach.serviceNames ||
              coach.experienceYears ||
              coach.happyClientCount) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {coach.experienceYears ?
                  <Stat
                    label="Years experience"
                    value={String(coach.experienceYears)}
                  />
                : null}
                {coach.happyClientCount ?
                  <Stat
                    label="Happy clients"
                    value={String(coach.happyClientCount)}
                  />
                : null}
                {coach.rating ?
                  <Stat
                    label="Rating"
                    value={`${coach.rating.toFixed(1)} (${coach.reviewCount ?? 0})`}
                  />
                : null}
              </div>
            )}

            {coach.serviceNames ?
              <div>
                <h3 className="font-display text-xl font-bold">Services</h3>
                <p className="mt-2 break-words text-ink-muted">
                  {coach.serviceNames}
                </p>
              </div>
            : null}
          </div>

          <div id="contact" className="mc-card bg-paper-elevated p-5 sm:p-8">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Start My Transformation
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Send an enquiry to {coach.coachName}. They will get notified by
              email.
            </p>
            <div className="mt-6">
              <CoachEnquiryForm coachCode={coach.coachCode} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface p-4">
      <p className="text-xs tracking-wide text-ink-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
