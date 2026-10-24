"use client";

import { useState } from "react";
import Link from "next/link";

import type { CoachProfile } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { ProfileCoverImage } from "@/components/coach-profile/profile-cover-image";
import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";
import { SupportActions } from "@/components/practice/support-dialog";

function LogoMark({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  const [tracked, setTracked] = useState(src);
  if (src !== tracked) {
    setTracked(src);
    setFailed(false);
  }
  if (!src || failed) return null;
  return (
    <span className="absolute -right-1 -bottom-1 size-11 overflow-hidden rounded-xl border-2 border-white bg-white shadow-[var(--mc-shadow-sm)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}

export type ProfileOverviewProps = {
  profile: CoachProfile;
  displayName: string;
  businessName: string;
  categoryLabel: string;
  placeLabel: string;
  tagline: string;
  aboutText: string;
  serviceLabels: string[];
  coverSrc: string;
  photoSrc: string;
  logoSrc: string;
  publicUrl: string | null | undefined;
  session: { coachCode?: string; coachId: number } | null;
  premiumLabel: string;
  premiumLink: string;
  completion: { percent: number; missingLabels: string[] };
  onEdit: () => void;
};

/** Read-only profile: main card and gallery beside the public page, plan and account cards. */
export function ProfileOverview({
  profile,
  displayName,
  businessName,
  categoryLabel,
  placeLabel,
  tagline,
  aboutText,
  serviceLabels,
  coverSrc,
  photoSrc,
  logoSrc,
  publicUrl,
  session,
  premiumLabel,
  premiumLink,
  completion,
  onEdit,
}: ProfileOverviewProps) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-5">
      <div className="grid min-w-0 gap-4">
        <section className="mc-panel overflow-hidden">
          <div className="relative h-40 bg-[image:var(--mc-gradient)] sm:h-48">
            {coverSrc ?
              <ProfileCoverImage src={coverSrc} />
            : null}
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit profile"
              title="Edit profile"
              className="absolute top-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-[#2a4a3a] shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <i className="fas fa-pen" style={{ fontSize: 15 }} aria-hidden />
            </button>
          </div>
          <div className="px-5 pb-6 sm:px-6">
            <div className="sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-6">
              <div className="relative z-10 -mt-12 mb-4 size-24 shrink-0 sm:-mt-16 sm:mb-0 sm:size-[7.5rem]">
                <div className="relative size-full overflow-hidden rounded-full border-4 border-white bg-mc-secondary shadow-[0_8px_24px_rgba(27,67,50,0.18)]">
                  <CoachPhoto
                    src={photoSrc || logoSrc}
                    alt=""
                    name={displayName}
                    className="object-cover"
                  />
                </div>
                {logoSrc ?
                  <LogoMark src={logoSrc} />
                : null}
              </div>
              <div className="min-w-0 sm:pt-5">
                <h2 className="font-display text-2xl font-extrabold tracking-tight break-words text-ink sm:text-3xl">
                  {displayName}
                </h2>
                {businessName.trim() && businessName.trim() !== displayName ?
                  <p className="mt-0.5 text-sm break-words text-ink-muted">
                    {businessName.trim()}
                  </p>
                : null}
                <p className="mt-1 text-sm font-semibold break-words text-mc-secondary">
                  {categoryLabel || "Category not set"}
                </p>
                <p className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm break-words text-ink-muted">
                  <i
                    className="fas fa-map-marker-alt"
                    style={{ fontSize: 14 }}
                    aria-hidden
                  />
                  {placeLabel || "City not set"}
                </p>
                {tagline.trim() ?
                  <p className="mt-2 text-sm font-semibold break-words text-[color:var(--mc-accent)]">
                    {tagline.trim()}
                  </p>
                : null}
              </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-line pt-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-10">
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  About
                </h3>
                <p
                  className={
                    aboutText ?
                      "mt-2 max-w-[65ch] text-[15px] leading-relaxed whitespace-pre-wrap text-ink"
                    : "mt-2 text-sm text-ink-muted"
                  }
                >
                  {aboutText || "No about yet."}
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  Services
                </h3>
                {serviceLabels.length ?
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {serviceLabels.map((label) => (
                      <li
                        key={label}
                        className="rounded-full bg-mc-secondary-light px-3 py-1 text-sm font-semibold text-mc-secondary"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                : <p className="mt-2 text-sm text-ink-muted">
                    No services yet.
                  </p>
                }
              </div>
            </div>
          </div>
        </section>
        <section className="mc-panel flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold tracking-tight text-ink">
              Posts
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              Photos and videos shown on your public page.
            </p>
          </div>
          <Link href="/dashboard/events" className="mc-btn-secondary">
            <i className="fas fa-images" aria-hidden /> Manage
          </Link>
        </section>
      </div>
      <aside className="grid gap-4 lg:sticky lg:top-24">
        <section className="mc-panel p-4 sm:p-5">
          <h3 className="mb-3 font-display text-base font-bold tracking-tight text-ink">
            Your public page
          </h3>
          <div className="flex flex-col gap-3">
            <ShareProfileButton
              coachName={displayName}
              url={publicUrl ?? ""}
              disabled={!publicUrl}
              variant="primary"
              className="w-full"
            />
            {publicUrl ?
              <Link
                href={`/coach/${encodeURIComponent(session?.coachCode || profile.coachCode || "")}`}
                className="mc-btn-secondary w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                View public page
              </Link>
            : null}
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            {profile.isProfileVisible === false ?
              "Find a Coach listing is off until the required public fields are saved."
            : profile.isProfileVisible ?
              "Listed on Find a Coach."
            : "Share this page when you want someone to open your profile."}
          </p>
        </section>
        <section className="mc-panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold tracking-tight text-ink">
              Subscription
            </h3>
            <span className="rounded-full bg-mc-secondary-light px-2.5 py-1 font-display text-sm font-bold text-mc-secondary">
              {premiumLabel}
            </span>
          </div>
          <Link
            href={premiumLink}
            className="mc-btn-primary mt-4 min-h-10 w-full text-[13px]"
          >
            Manage Premium
          </Link>
        </section>
        <section className="mc-panel p-2 sm:p-3">
          <h3 className="px-2 pt-2 pb-1 font-display text-base font-bold tracking-tight text-ink sm:px-3">
            Account
          </h3>
          <div className="grid">
            <Link
              href="/dashboard/profile/password"
              className="flex min-h-11 items-center gap-3 rounded-[10px] px-2 text-[14px] font-semibold text-ink hover:bg-mc-secondary-light sm:px-3"
            >
              <i
                className="fas fa-key w-4 text-center text-mc-secondary"
                aria-hidden
              />
              Change password
            </Link>
            <SupportActions list />
          </div>
        </section>
        {profile.isProfileVisible === false || completion.percent < 100 ?
          <div className="grid gap-4">
            {profile.isProfileVisible === false ?
              <div className="mc-panel flex items-baseline justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink">
                    Find a Coach listing is off
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {completion.missingLabels.length ?
                      `Save these details on this profile: ${completion.missingLabels.join(", ")}. Find a Coach lists a profile once every required field is saved.`
                    : "Save this profile again. Find a Coach lists a profile once every required field is saved."
                    }
                  </p>
                </div>
                <p className="font-display text-3xl font-bold text-ink tabular-nums">
                  {completion.percent}%
                </p>
              </div>
            : profile && completion.percent < 100 ?
              <div className="mc-panel flex items-baseline justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-ink">
                    Profile completion
                  </p>
                  {completion.missingLabels.length ?
                    <p className="mt-1 text-sm text-ink-muted">
                      Still needed: {completion.missingLabels.join(", ")}
                    </p>
                  : null}
                </div>
                <p className="font-display text-3xl font-bold text-ink tabular-nums">
                  {completion.percent}%
                </p>
              </div>
            : null}
          </div>
        : null}
      </aside>
    </div>
  );
}
