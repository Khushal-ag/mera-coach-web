"use client";

import { useState } from "react";

import { SHOWCASE_PREVIEW } from "@/constants/showcase";
import { formatMoney } from "@/lib/format";

export type ShowcasePackage = {
  id: number;
  brandName: string;
  name: string;
  total: number;
  items: { name: string; amount: number }[];
};

export type ShowcasePost = {
  id: number;
  title: string;
  description: string;
  /** Already formatted, for example "17 Oct 2026". */
  when: string;
  location: string;
  src: string;
  isVideo: boolean;
  /** First name of the client, for success stories. */
  clientName: string;
};

type Props = {
  coachName: string;
  packages: ShowcasePackage[];
  gallery: ShowcasePost[];
  events: ShowcasePost[];
  stories: ShowcasePost[];
  /** Pre-select the enquiry form with this label and scroll to it. */
  onEnquire: (label: string) => void;
};

function Media({
  post,
  className,
}: {
  post: ShowcasePost;
  className?: string;
}) {
  return post.isVideo ?
      <video
        className={className}
        src={post.src}
        controls
        playsInline
        preload="metadata"
        aria-label={post.title}
      />
      // eslint-disable-next-line @next/next/no-img-element
    : <img
        className={className}
        src={post.src}
        alt={post.title}
        loading="lazy"
      />;
}

function ShowMore({
  total,
  shown,
  noun,
  open,
  onToggle,
}: {
  total: number;
  shown: number;
  noun: string;
  open: boolean;
  onToggle: () => void;
}) {
  if (total <= shown) return null;
  return (
    <div className="cp-showmore">
      <button type="button" className="btn btn-outline" onClick={onToggle}>
        {open ? "Show less" : `Show all ${total} ${noun}`}
      </button>
    </div>
  );
}

function Meta({ post }: { post: ShowcasePost }) {
  return (
    <>
      {post.when ?
        <p className="cp-offer-line">
          <i className="fas fa-calendar-alt" aria-hidden />
          {post.when}
        </p>
      : null}
      {post.location ?
        <p className="cp-offer-line">
          <i className="fas fa-map-marker-alt" aria-hidden />
          {/^(online|zoom|google meet|virtual)/i.test(post.location) ?
            post.location
          : <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(post.location)}`}
              target="_blank"
              rel="noreferrer"
            >
              {post.location}
            </a>
          }
        </p>
      : null}
    </>
  );
}

/** Packages, gallery, events and client success stories on a public coach profile. */
export function CoachShowcase({
  coachName,
  packages,
  gallery,
  events,
  stories,
  onEnquire,
}: Props) {
  const [open, setOpen] = useState({
    packages: false,
    gallery: false,
    events: false,
    stories: false,
  });
  const toggle = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const visible = <T,>(list: T[], key: keyof typeof open) =>
    open[key] ? list : list.slice(0, SHOWCASE_PREVIEW[key]);

  return (
    <>
      {packages.length > 0 ?
        <section className="cp-showcase" id="packages">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">
                <i className="fas fa-box" /> Packages
              </div>
              <h2 className="section-title">Coaching Packages</h2>
              <p className="section-subtitle">
                Product packages {coachName} offers, with what is included.
              </p>
            </div>
            <div className="cp-offer-grid">
              {visible(packages, "packages").map((pkg) => (
                <article className="cp-offer-card cp-pkg-card" key={pkg.id}>
                  <div className="cp-pkg-head">
                    <span className="cp-pkg-brand">{pkg.brandName}</span>
                    <h3>{pkg.name}</h3>
                  </div>
                  <div className="cp-offer-body">
                    <ul className="cp-pkg-items">
                      {pkg.items.map((item, index) => (
                        <li key={`${item.name}-${index}`}>
                          <span>{item.name}</span>
                          <span>{formatMoney(item.amount)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="cp-pkg-total">
                      <span>Total</span>
                      <strong>{formatMoney(pkg.total)}</strong>
                    </p>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => onEnquire(pkg.name)}
                    >
                      Enquire about this
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <ShowMore
              total={packages.length}
              shown={SHOWCASE_PREVIEW.packages}
              noun="packages"
              open={open.packages}
              onToggle={() => toggle("packages")}
            />
          </div>
        </section>
      : null}

      {gallery.length > 0 ?
        <section className="cp-showcase cp-showcase-alt" id="gallery">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">
                <i className="fas fa-images" /> Photos
              </div>
              <h2 className="section-title">Gallery</h2>
            </div>
            <div className="cp-gallery-grid">
              {visible(gallery, "gallery").map((post) => (
                <figure key={post.id} className="cp-gallery-item">
                  <Media post={post} />
                  {post.title && post.title !== "Gallery photo" ?
                    <figcaption className="cp-gallery-tag">
                      {post.title}
                    </figcaption>
                  : null}
                </figure>
              ))}
            </div>
            <ShowMore
              total={gallery.length}
              shown={SHOWCASE_PREVIEW.gallery}
              noun="photos and videos"
              open={open.gallery}
              onToggle={() => toggle("gallery")}
            />
          </div>
        </section>
      : null}

      {events.length > 0 ?
        <section className="cp-showcase" id="events">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">
                <i className="fas fa-calendar-alt" /> Events
              </div>
              <h2 className="section-title">Workshops &amp; Events</h2>
            </div>
            <div className="cp-offer-grid">
              {visible(events, "events").map((evt) => (
                <article className="cp-offer-card" key={evt.id}>
                  <Media post={evt} />
                  <div className="cp-offer-body">
                    <h3>{evt.title}</h3>
                    <Meta post={evt} />
                    {evt.description ?
                      <p className="cp-offer-text">{evt.description}</p>
                    : null}
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => onEnquire(evt.title)}
                    >
                      Enquire about this event
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <ShowMore
              total={events.length}
              shown={SHOWCASE_PREVIEW.events}
              noun="events"
              open={open.events}
              onToggle={() => toggle("events")}
            />
          </div>
        </section>
      : null}

      {stories.length > 0 ?
        <section className="cp-showcase cp-showcase-alt" id="success-stories">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">
                <i className="fas fa-trophy" /> Success Stories
              </div>
              <h2 className="section-title">Client Success</h2>
              <p className="section-subtitle">
                Results {coachName}&apos;s clients are proud to share.
              </p>
            </div>
            <div className="cp-offer-grid">
              {visible(stories, "stories").map((story) => (
                <article className="cp-offer-card" key={story.id}>
                  <Media post={story} />
                  <div className="cp-offer-body">
                    <h3>{story.title}</h3>
                    {story.description ?
                      <p className="cp-offer-text">{story.description}</p>
                    : null}
                    <p className="cp-story-by">
                      {[story.clientName, story.location, story.when]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <ShowMore
              total={stories.length}
              shown={SHOWCASE_PREVIEW.stories}
              noun="stories"
              open={open.stories}
              onToggle={() => toggle("stories")}
            />
          </div>
        </section>
      : null}
    </>
  );
}
