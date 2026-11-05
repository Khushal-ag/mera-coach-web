"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { ProfileCompletion } from "@/lib/profile-completion";
import type { CoachProfile } from "@/types/coach";
import type { CoachPost } from "@/types/showcase";

import { CoachPhoto } from "@/components/coach-photo";
import { ProfileCoverImage } from "@/components/coach-profile/profile-cover-image";
import { ShareProfileButton } from "@/components/coach-profile/share-profile-button";
import { ProfileCompletionCard } from "@/components/practice/profile-completion";
import { SupportActions } from "@/components/practice/support-dialog";
import { isSubscriptionRequired } from "@/config/practice";
import { fetchMyPosts } from "@/lib/api/showcase";
import { coachProfilePath } from "@/lib/coach/profile-path";
import { resolveMediaUrl } from "@/lib/media/media-url";
import { describeValidity } from "@/lib/validity";

const POSTS_SHOWN = 8;

/** The coach's own posts, as they appear on the public page. Manage opens the full list. */
function ProfilePosts() {
  const [posts, setPosts] = useState<CoachPost[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchMyPosts()
      .then((rows) => {
        if (!cancelled) setPosts(rows);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mc-panel p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
      </div>
      {failed ?
        <p className="text-sm text-ink-muted">
          Could not load your posts. Open Manage to try again.
        </p>
      : posts === null ?
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="mc-skeleton aspect-square" />
          ))}
        </div>
      : posts.length === 0 ?
        <p className="text-sm text-ink-muted">
          No posts yet. Add photos, workshops or success stories from Manage.
        </p>
      : <div className="grid grid-cols-3 gap-1.5 sm:gap-3 md:grid-cols-4">
          {posts.slice(0, POSTS_SHOWN).map((post) => (
            <Link
              key={post.postId}
              href="/dashboard/events"
              title={post.title}
              className="group relative block aspect-square overflow-hidden rounded-lg bg-black/5"
            >
              {
                post.mediaType === "video" ?
                  <>
                    <video
                      src={resolveMediaUrl(post.mediaUrl)}
                      muted
                      preload="metadata"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center">
                      <i
                        className="fas fa-play-circle text-3xl text-white drop-shadow"
                        aria-hidden
                      />
                    </span>
                  </>
                  // eslint-disable-next-line @next/next/no-img-element
                : <img
                    src={resolveMediaUrl(post.mediaUrl)}
                    alt={post.title}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition group-hover:scale-105"
                  />

              }
            </Link>
          ))}
        </div>
      }
      {posts && posts.length > POSTS_SHOWN ?
        <p className="mt-3 text-sm text-ink-muted">
          Showing {POSTS_SHOWN} of {posts.length}.{" "}
          <Link
            href="/dashboard/events"
            className="font-semibold text-mc-secondary"
          >
            See all
          </Link>
        </p>
      : null}
    </section>
  );
}

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
  session: {
    coachCode?: string;
    coachId: number;
    premiumPaid?: boolean;
  } | null;
  premiumLabel: string;
  premiumLink: string;
  completion: ProfileCompletion;
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
        <ProfilePosts />
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
                href={coachProfilePath({
                  urlFriendlyName: profile.urlFriendlyName,
                  coachCode: session?.coachCode || profile.coachCode,
                })}
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
        {isSubscriptionRequired() ?
          <SubscriptionCard
            validUpto={profile.validUpto}
            premiumLabel={premiumLabel}
            premiumLink={premiumLink}
          />
        : null}
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
        {!completion.isPublicReady || completion.percent < 100 ?
          <ProfileCompletionCard
            completion={completion}
            variant="detailed"
            showAction={false}
          />
        : null}
      </aside>
    </div>
  );
}

const TONE_STYLE = {
  ok: {
    chip: "bg-mc-secondary-light text-mc-secondary",
    icon: "fa-circle-check",
  },
  soon: { chip: "bg-amber-100 text-amber-800", icon: "fa-clock" },
  expired: { chip: "bg-red-100 text-red-700", icon: "fa-circle-exclamation" },
} as const;

function daysLeftText(daysLeft: number) {
  if (daysLeft < 0) return "Expired";
  if (daysLeft === 0) return "Ends today";
  return daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
}

function SubscriptionCard({
  validUpto,
  premiumLabel,
  premiumLink,
}: {
  validUpto?: string | null;
  premiumLabel: string;
  premiumLink: string;
}) {
  const validity = describeValidity(validUpto);
  const tone = TONE_STYLE[validity?.tone ?? "ok"];
  const needsRenewal = validity ? validity.tone !== "ok" : false;
  return (
    <section className="mc-panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold tracking-tight text-ink">
          <i className="fas fa-crown mr-2 text-mc-accent" aria-hidden />
          Subscription
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-sm font-bold ${tone.chip}`}
        >
          <i className={`fas ${tone.icon}`} aria-hidden />
          {validity?.tone === "expired" ? "Expired" : premiumLabel}
        </span>
      </div>
      {validity ?
        <div className="mt-4 flex items-end justify-between gap-3 rounded-xl bg-mc-secondary-light/60 px-4 py-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Valid until
            </p>
            <p className="font-display text-lg font-extrabold text-ink">
              {validity.dateLabel}
            </p>
          </div>
          <p className="text-sm font-bold text-ink">
            {daysLeftText(validity.daysLeft)}
          </p>
        </div>
      : null}
      {needsRenewal ?
        <p className="mt-3 text-sm text-ink-muted">
          {validity?.tone === "expired" ?
            "Renew to add new clients again."
          : "Renew soon so you never lose access."}
        </p>
      : <p className="mt-3 text-sm text-ink-muted">
          No automatic renewal. You are only charged when you choose a plan.
        </p>
      }
      <Link
        href={premiumLink}
        className="mc-btn-primary mt-4 min-h-10 w-full text-[13px]"
      >
        {needsRenewal ? "Renew plan" : "Manage plan"}
      </Link>
    </section>
  );
}
