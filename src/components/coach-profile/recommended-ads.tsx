"use client";

import { useEffect, useState } from "react";

import type { CoachAd } from "@/lib/api/admin";

import { fetchPublicAds } from "@/lib/api/admin";
import { resolveMediaUrl } from "@/lib/media/media-url";

type Props = {
  coachCode: string;
  coachName: string;
  /** Rating line for the fallback badge, for example "4.8 / 5 Rating". */
  ratingText: string;
};

/** Shown when there are no creatives to show, or they could not be loaded. */
function PlatformRecognition({ ratingText }: { ratingText: string }) {
  return (
    <div className="cp-sb-widget cp-sb-badge">
      <div className="cp-sbw-head">
        <i className="fas fa-medal" /> Platform Recognition
      </div>
      <div className="cp-sbw-body cp-badge-body">
        <div className="cp-badge-item">
          <i className="fas fa-crown cp-badge-icon gold" />
          <div>
            <strong>Top Coach 2025</strong>
            <span>Mera Coach Verified</span>
          </div>
        </div>
        <div className="cp-badge-item">
          <i className="fas fa-shield-alt cp-badge-icon green" />
          <div>
            <strong>100% Verified</strong>
            <span>All credentials checked</span>
          </div>
        </div>
        <div className="cp-badge-item">
          <i className="fas fa-star cp-badge-icon gold" />
          <div>
            <strong>Premium Coach</strong>
            <span>{ratingText}</span>
          </div>
        </div>
        <div className="cp-badge-item">
          <i className="fas fa-bolt cp-badge-icon green" />
          <div>
            <strong>Fast Responder</strong>
            <span>Replies within 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecommendedAds({ coachCode, coachName, ratingText }: Props) {
  const [ads, setAds] = useState<CoachAd[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicAds(coachCode)
      .then((rows) => {
        if (!cancelled) setAds(rows.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [coachCode]);

  // Render nothing until the request settles, so the fallback never flashes before the creatives.
  if (!ads) return null;
  if (ads.length === 0) return <PlatformRecognition ratingText={ratingText} />;

  const label = coachName?.trim() ? coachName.trim() : "this coach";

  return (
    <div className="cp-sb-widget cp-sb-ads">
      <div className="cp-sbw-head">
        <i className="fas fa-thumbs-up" /> Recommended by {label}
      </div>
      <div className="cp-sbw-body cp-ads-body">
        {ads.map((ad) => {
          const src = resolveMediaUrl(ad.imageUrl) || ad.imageUrl;
          const alt = ad.altText || ad.title || "Recommended";
          const inner = (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="cp-ad-img" loading="lazy" />
          );
          return (
            <div key={ad.adId} className="cp-ad-item">
              {ad.linkUrl ?
                <a
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="cp-ad-link"
                >
                  {inner}
                  {ad.title ?
                    <span className="cp-ad-caption">
                      {ad.title}
                      <i className="fas fa-arrow-right" aria-hidden />
                    </span>
                  : null}
                </a>
              : <>
                  {inner}
                  {ad.title ?
                    <span className="cp-ad-caption">{ad.title}</span>
                  : null}
                </>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
