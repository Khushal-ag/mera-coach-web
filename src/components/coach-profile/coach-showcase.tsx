"use client";

import { useState } from "react";

import { SHOWCASE_PREVIEW } from "@/constants/showcase";
import { splitPackDetail } from "@/lib/coach/pack-detail";
import { whatsAppUrlWithText } from "@/lib/coach/whatsapp";
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

type EnquiryProps = {
  coachName: string;
  /** The coach's WhatsApp chat link, or null when they have no usable number. */
  whatsappUrl: string | null;
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

/** One enquiry action: WhatsApp with the message typed in, or the enquiry form when there is no WhatsApp number. */
function EnquireButton({
  coachName,
  whatsappUrl,
  onEnquire,
  label,
  subject,
}: EnquiryProps & { label: string; subject: string }) {
  if (whatsappUrl) {
    return (
      <a
        href={whatsAppUrlWithText(
          whatsappUrl,
          `Hi ${coachName}, I would like to enquire about ${subject}.`,
        )}
        className="btn cp-btn-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fab fa-whatsapp" /> Enquire on WhatsApp
      </a>
    );
  }
  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={() => onEnquire(label)}
    >
      Enquire now
    </button>
  );
}

/** Previous / next arrows with a "2 / 5" count, shown in a sidebar card's header. */
function WidgetPager({
  index,
  total,
  noun,
  onChange,
}: {
  index: number;
  total: number;
  noun: string;
  onChange: (next: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="cp-sbw-pager">
      <button
        type="button"
        aria-label={`Previous ${noun}`}
        onClick={() => onChange((index - 1 + total) % total)}
      >
        <i className="fas fa-chevron-left" aria-hidden />
      </button>
      <span aria-live="polite">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        aria-label={`Next ${noun}`}
        onClick={() => onChange((index + 1) % total)}
      >
        <i className="fas fa-chevron-right" aria-hidden />
      </button>
    </div>
  );
}

/** Sidebar card showing one of the coach's packages at a time, with arrows to move between them. Renders nothing when there are none. */
export function PackagesWidget({
  packages,
  ...enquiry
}: EnquiryProps & { packages: ShowcasePackage[] }) {
  const [index, setIndex] = useState(0);
  if (packages.length === 0) return null;
  const pkg = packages[Math.min(index, packages.length - 1)]!;
  return (
    <div className="cp-sb-widget" id="packages">
      <div className="cp-sbw-head">
        <span>
          <i className="fas fa-box" /> Packages
        </span>
        <WidgetPager
          index={index}
          total={packages.length}
          noun="package"
          onChange={setIndex}
        />
      </div>
      <div className="cp-sbw-body cp-sb-offers">
        {[pkg].map((pkg) => (
          <article className="cp-offer-card cp-pkg-card" key={pkg.id}>
            <div className="cp-pkg-head">
              <div className="cp-pkg-title">
                <span className="cp-pkg-brand">{pkg.brandName}</span>
                <h3>{pkg.name}</h3>
              </div>
              <strong className="cp-pkg-total">{formatMoney(pkg.total)}</strong>
            </div>
            <div className="cp-offer-body">
              <ul className="cp-pkg-items">
                {pkg.items.map((item, index) => {
                  const { name, pack } = splitPackDetail(item.name);
                  return (
                    <li key={`${item.name}-${index}`}>
                      <span>{name}</span>
                      {pack ?
                        <span>{pack}</span>
                      : null}
                    </li>
                  );
                })}
              </ul>
              <div className="cp-pkg-actions">
                <EnquireButton
                  {...enquiry}
                  label={pkg.name}
                  subject={`the "${pkg.name}" package (${formatMoney(pkg.total)})`}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Sidebar card showing one of the coach's posts at a time, with arrows to move between them. Renders nothing when there are none. */
export function EventsWidget({
  events,
  ...enquiry
}: EnquiryProps & { events: ShowcasePost[] }) {
  const [index, setIndex] = useState(0);
  if (events.length === 0) return null;
  const current = events[Math.min(index, events.length - 1)]!;
  return (
    <div className="cp-sb-widget" id="events">
      <div className="cp-sbw-head">
        <span>
          <i className="fas fa-images" /> Posts
        </span>
        <WidgetPager
          index={index}
          total={events.length}
          noun="post"
          onChange={setIndex}
        />
      </div>
      <div className="cp-sbw-body cp-sb-offers">
        {[current].map((evt) => (
          <article className="cp-offer-card" key={evt.id}>
            <Media post={evt} />
            <div className="cp-offer-body">
              <h3>{evt.title}</h3>
              <Meta post={evt} />
              {evt.description ?
                <p className="cp-offer-text">{evt.description}</p>
              : null}
              <EnquireButton
                {...enquiry}
                label={evt.title}
                subject={`your post "${evt.title}"`}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Photo and video gallery section. Renders nothing when there is none. */
export function CoachGallery({ gallery }: { gallery: ShowcasePost[] }) {
  const [open, setOpen] = useState(false);
  if (gallery.length === 0) return null;
  const shown = open ? gallery : gallery.slice(0, SHOWCASE_PREVIEW.gallery);
  return (
    <section className="cp-showcase cp-showcase-alt" id="gallery">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-images" /> Photos
          </div>
          <h2 className="section-title">Gallery</h2>
        </div>
        <div className="cp-gallery-grid">
          {shown.map((post) => (
            <figure key={post.id} className="cp-gallery-item">
              <Media post={post} />
              {post.title && post.title !== "Gallery photo" ?
                <figcaption className="cp-gallery-tag">{post.title}</figcaption>
              : null}
            </figure>
          ))}
        </div>
        <ShowMore
          total={gallery.length}
          shown={SHOWCASE_PREVIEW.gallery}
          noun="photos and videos"
          open={open}
          onToggle={() => setOpen((v) => !v)}
        />
      </div>
    </section>
  );
}

/** Client success stories, shown inside the green "Real Clients, Real Results" section. */
export function SuccessStories({ stories }: { stories: ShowcasePost[] }) {
  const [open, setOpen] = useState(false);
  const shown = open ? stories : stories.slice(0, SHOWCASE_PREVIEW.stories);
  return (
    <>
      <div className="cp-offer-grid">
        {shown.map((story) => (
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
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
    </>
  );
}
