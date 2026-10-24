"use client";

import { useEffect, useRef, useState } from "react";

import type { ReactNode } from "react";

import type {
  ShowcasePackage,
  ShowcasePost,
} from "@/components/coach-profile/coach-showcase";
import type { ReviewsPage } from "@/types/reviews";

import { CoachPhoto } from "@/components/coach-photo";
import { CoachReviews } from "@/components/coach-profile/coach-reviews";
import {
  CoachGallery,
  EventsWidget,
  PackagesWidget,
  SuccessStories,
} from "@/components/coach-profile/coach-showcase";
import { ExpandableBio } from "@/components/coach-profile/expandable-bio";
import { ListEmpty } from "@/components/list-empty";
import { Stars } from "@/components/stars";
import { MenuSelect } from "@/components/ui/menu-select";
import { siteConfig } from "@/config/site";
import {
  COACHING_PROCESS,
  ENQUIRY_ADVICE_OPTION,
  EXPERTISE_BLURB,
} from "@/constants/coach-profile";
import { submitCoachEnquiry } from "@/lib/api/coach";
import { firstApiError, isApiSuccess } from "@/lib/api/normalize";
import { copyText } from "@/lib/clipboard";

export type CoachProfileDetails = {
  coachCode: string;
  coachName: string;
  coachType: string;
  city: string;
  tagline: string;
  bio: string;
  services: string[];
  expYears: number;
  clients: number;
  certs: number;
  rating: number;
  reviewsPage: ReviewsPage;
  reviews: number;
  photoSrc: string;
  /** Cover image from Edit Profile. Shown softly behind the profile header. */
  coverSrc: string;
  whatsappUrl: string;
  packages: ShowcasePackage[];
  gallery: ShowcasePost[];
  events: ShowcasePost[];
  stories: ShowcasePost[];
};

type ModalState =
  | { kind: "success"; title: string; enquiry?: boolean }
  | { kind: "error"; title: string; errors?: string[]; text?: string }
  | { kind: "info"; title: string; text: string };

export function CoachProfileView({ coach }: { coach: CoachProfileDetails }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [service, setService] = useState("");
  const qrRef = useRef<HTMLImageElement>(null);
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const profileUrl = `${siteConfig.url}/coach/${encodeURIComponent(coach.coachCode)}`;
  const shareText = encodeURIComponent(
    `${coach.coachName} – Check out this coach on Mera Coach! ${profileUrl}`,
  );
  const share = {
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    ig: `https://www.instagram.com/?url=${encodeURIComponent(profileUrl)}`,
    wa: `https://wa.me/?text=${shareText}`,
  };
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=144x144&color=1b1b2f&bgcolor=ffffff&data=${encodeURIComponent(profileUrl)}`;
  const lookingFor = [
    ...coach.services,
    ...coach.packages
      .map((pkg) => pkg.name)
      .filter((name) => !coach.services.includes(name)),
  ];

  useEffect(() => {
    if (!modal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [modal]);

  function closeModal() {
    const reload = modal?.kind === "success" && modal.enquiry;
    setModal(null);
    if (reload) window.location.reload();
  }

  const whatsappUrl = coach.whatsappUrl === "#" ? null : coach.whatsappUrl;

  function enquireAbout(label: string) {
    setService(label);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  function copyProfileLink() {
    const url = window.location.href;
    void copyText(url).then((ok) => {
      if (!ok) return;
      setModal({
        kind: "info",
        title: "Link Copied",
        text: "Profile link has been copied to your clipboard.",
      });
    });
  }

  function downloadProfileQR() {
    const src = qrRef.current?.src;
    if (src) window.open(src, "_blank", "noopener,noreferrer");
  }

  async function submitEnquiry() {
    const name = nameRef.current?.value.trim() ?? "";
    const mobile = mobileRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const svc = service.trim();
    const errors: string[] = [];
    if (!name) errors.push("Name is required.");
    else if (!/^[a-zA-Z.\s]+$/.test(name)) {
      errors.push("Name may only contain letters, spaces and dot (.).");
    }
    if (!mobile) errors.push("Mobile number is required.");
    else if (!/^[0-9-]+$/.test(mobile)) {
      errors.push(
        "Mobile number may only contain digits (0–9) and hyphen (-).",
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address.");
    }
    if (!svc) errors.push("Please select what you are looking for.");
    if (errors.length) {
      setModal({
        kind: "error",
        title: "Please fix the following",
        errors,
      });
      return;
    }

    setSending(true);
    try {
      const response = await submitCoachEnquiry({
        coachCode: coach.coachCode,
        clientName: name,
        clientMobile: mobile,
        clientEmail: email,
        lookingFor: svc,
      });
      if (isApiSuccess(response)) {
        setModal({
          kind: "success",
          title: "Enquiry Sent!",
          enquiry: true,
        });
        return;
      }
      setModal({
        kind: "error",
        title: "Something went wrong",
        text: firstApiError(response) ?? "Please try again later.",
      });
      setSending(false);
    } catch {
      setModal({
        kind: "error",
        title: "Connection Error",
        text: "Unable to send your enquiry. Please try again later.",
      });
      setSending(false);
    }
  }

  const ratingLabel = coach.rating.toFixed(1);
  const stats: { num: ReactNode; label: string }[] = [];
  if (coach.clients > 0) {
    stats.push({
      num: (
        <>
          {coach.clients}
          <span>+</span>
        </>
      ),
      label: "Happy Clients",
    });
  }
  if (coach.expYears > 0) {
    stats.push({
      num: (
        <>
          {coach.expYears}
          <span>+</span>
        </>
      ),
      label: "Years Experience",
    });
  }
  if (coach.certs > 0) {
    stats.push({ num: coach.certs, label: "Certifications" });
  }
  if (coach.services.length > 0) {
    stats.push({ num: coach.services.length, label: "Services Offered" });
  }
  if (coach.rating > 0) stats.push({ num: ratingLabel, label: "Rating" });

  const place = [coach.coachType, coach.city].filter(Boolean).join(", ");

  return (
    <div className="mc-public">
      <section
        className={coach.coverSrc ? "cp-hero cp-hero-cover" : "cp-hero"}
        style={
          coach.coverSrc ?
            ({
              "--cp-cover": `url("${coach.coverSrc}")`,
            } as React.CSSProperties)
          : undefined
        }
      >
        <div className="cp-hero-shapes">
          <div className="cp-hs cp-hs-1" />
          <div className="cp-hs cp-hs-2" />
          <div className="cp-hs cp-hs-3" />
        </div>
        <div className="container">
          <div className="cp-hero-grid">
            <div className="cp-hero-photo-col">
              <div className="cp-photo-frame">
                <div className="cp-photo-ring" />
                <div className="cp-photo-wrap">
                  <CoachPhoto
                    src={coach.photoSrc}
                    alt={coach.coachName}
                    name={coach.coachName}
                    priority
                  />
                </div>
                <div className="cp-photo-blob" />
              </div>
              <div className="cp-hero-ctas">
                <a href="#contact" className="btn cp-btn-book">
                  <i className="fas fa-calendar-check" /> Book Free Consultation
                </a>
                <a href="#expertise" className="btn cp-btn-explore">
                  <i className="fas fa-layer-group" /> Explore Services
                </a>
                <a
                  href={coach.whatsappUrl}
                  className="btn cp-btn-whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp" /> WhatsApp Me
                </a>
              </div>
            </div>
            <div className="cp-hero-left">
              <div className="cp-hero-tags">
                {coach.coachType ?
                  <span className="cp-tag-badge">
                    <i className="fas fa-medal" /> {coach.coachType}
                  </span>
                : null}
                <span className="cp-avail-badge">
                  <span className="cp-avail-dot" /> Available Now
                </span>
              </div>
              <h1 className="cp-hero-name">{coach.coachName}</h1>
              {coach.tagline ?
                <p className="cp-hero-tagline">{coach.tagline}</p>
              : null}
              {coach.rating > 0 ?
                <div className="cp-hero-rating">
                  <div className="cp-stars">
                    <Stars rating={coach.rating} className="" />
                  </div>
                  <span className="cp-rating-val">{ratingLabel}</span>
                  {coach.reviews > 0 ?
                    <span className="cp-rating-count">
                      from {coach.reviews}{" "}
                      {coach.reviews === 1 ? "review" : "reviews"}
                    </span>
                  : null}
                </div>
              : null}
              {coach.bio ?
                <ExpandableBio text={coach.bio} />
              : null}
              <div className="cp-share-row">
                <span className="cp-share-label">Share:</span>
                <a
                  href={share.fb}
                  className="cp-share-btn cp-share-fb"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on Facebook"
                >
                  <i className="fab fa-facebook-f" />
                </a>
                <a
                  href={share.ig}
                  className="cp-share-btn cp-share-ig"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on Instagram"
                >
                  <i className="fab fa-instagram" />
                </a>
                <a
                  href={share.wa}
                  className="cp-share-btn cp-share-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on WhatsApp"
                >
                  <i className="fab fa-whatsapp" />
                </a>
                <button
                  type="button"
                  className="cp-share-btn cp-share-copy"
                  onClick={copyProfileLink}
                  title="Copy Link"
                >
                  <i className="fas fa-link" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="cp-hero-qr-corner">
          <div className="cp-iqr-box">
            <div id="profileQrCode">
              <img ref={qrRef} src={qrSrc} width={144} height={144} alt="" />
            </div>
          </div>
          <button
            type="button"
            onClick={downloadProfileQR}
            className="cp-iqr-dl"
          >
            <i className="fas fa-download" /> Save QR
          </button>
        </div>
      </section>

      <section className="cp-stats-strip">
        <div className="container">
          <div className="cp-stats-row">
            {stats.map((stat, index) => (
              <span key={stat.label} style={{ display: "contents" }}>
                <div className="cp-stat">
                  <span className="cp-stat-num">{stat.num}</span>
                  <span className="cp-stat-lbl">{stat.label}</span>
                </div>
                {index < stats.length - 1 ?
                  <div className="cp-stat-div" />
                : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="cp-mid-section">
        <div className="container">
          <div className="cp-mid-grid">
            <div className="cp-mid-main">
              <section className="cp-expertise" id="expertise">
                <div className="section-header">
                  <div className="section-tag">
                    <i className="fas fa-star" /> Areas of Expertise
                  </div>
                  <h2 className="section-title">What I Specialise In</h2>
                  <p className="section-subtitle">
                    Core areas where I bring expert knowledge and real-world
                    results.
                  </p>
                </div>
                <div className="cp-exp-grid">
                  {coach.services.length > 0 ?
                    coach.services.map((svc) => (
                      <div className="cp-exp-card" key={svc}>
                        <div className="cp-exp-icon">
                          <i className="fas fa-medal" />
                        </div>
                        <h4 aria-level={3}>{svc}</h4>
                        <p>{EXPERTISE_BLURB}</p>
                      </div>
                    ))
                  : <ListEmpty
                      title="Services not listed yet."
                      icon="fas fa-heart"
                    />
                  }
                </div>
              </section>
            </div>
            <aside className="cp-mid-aside">
              <PackagesWidget
                packages={coach.packages}
                coachName={coach.coachName}
                whatsappUrl={whatsappUrl}
                onEnquire={enquireAbout}
              />
              <EventsWidget
                events={coach.events}
                coachName={coach.coachName}
                whatsappUrl={whatsappUrl}
                onEnquire={enquireAbout}
              />
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
                      <span>
                        {coach.rating > 0 ?
                          `${ratingLabel} / 5 Rating`
                        : "New on Mera Coach"}
                      </span>
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
            </aside>
          </div>
        </div>
      </div>

      <CoachGallery gallery={coach.gallery} />

      <CoachReviews coachCode={coach.coachCode} initial={coach.reviewsPage} />

      <section className="cp-contact" id="contact">
        <div className="cp-contact-shapes">
          <div className="cp-cs cp-cs-1" />
          <div className="cp-cs cp-cs-2" />
          <div className="cp-cs cp-cs-3" />
        </div>
        <div className="container">
          <div className="cp-contact-split">
            <div className="cp-cf-card">
              <div className="cp-cf-head">
                <div className="section-tag cp-cf-tag">
                  <i className="fas fa-calendar-check" /> Get In Touch
                </div>
                <h2>
                  Book Your <em>Free</em>
                  <br />
                  Consultation
                </h2>
                <p>
                  {coach.coachName} personally responds within 24 hours, zero
                  cost, zero commitment.
                </p>
              </div>
              <div id="cpEnquiryForm">
                <div className="cp-cf-fields">
                  <div className="cp-form-group">
                    <label htmlFor="cpName">
                      <i className="fas fa-user" /> Your Name *
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      id="cpName"
                      placeholder="Full name"
                    />
                  </div>
                  <div className="cp-form-group">
                    <label htmlFor="cpMobile">
                      <i className="fas fa-mobile-alt" /> Mobile Number *
                    </label>
                    <input
                      ref={mobileRef}
                      type="tel"
                      id="cpMobile"
                      placeholder="+91 98765 00000"
                    />
                  </div>
                  <div className="cp-form-group">
                    <label htmlFor="cpEmail">
                      <i className="fas fa-envelope" /> Email Address
                    </label>
                    <input
                      ref={emailRef}
                      type="email"
                      id="cpEmail"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="cp-form-group">
                    <label htmlFor="cpService">
                      <i className="fas fa-layer-group" /> I&apos;m Looking For
                    </label>
                    <MenuSelect
                      id="cpService"
                      skin="public"
                      className="ui-select"
                      value={service}
                      placeholder="Select a service..."
                      options={[
                        { value: "", label: "Select a service..." },
                        ...lookingFor.map((svc) => ({
                          value: svc,
                          label: svc,
                        })),
                        {
                          value: ENQUIRY_ADVICE_OPTION,
                          label: ENQUIRY_ADVICE_OPTION,
                        },
                      ]}
                      onChange={(event) => setService(event.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn cp-cf-submit"
                  id="cpSubmitBtn"
                  onClick={submitEnquiry}
                  disabled={sending}
                >
                  {sending ?
                    <>
                      <i className="fas fa-spinner fa-spin" /> Sending...
                    </>
                  : <>
                      <i className="fas fa-paper-plane" /> Send My Request:
                      It&apos;s Free!
                      <span className="cp-cf-arrow">
                        <i className="fas fa-arrow-right" />
                      </span>
                    </>
                  }
                </button>
              </div>
              <div className="cp-cf-trust">
                <div className="cp-cf-trust-item">
                  <i className="fas fa-lock" />
                  <span>100% Free</span>
                </div>
                <div className="cp-cf-trust-sep" />
                <div className="cp-cf-trust-item">
                  <i className="fas fa-clock" />
                  <span>24-hr Reply</span>
                </div>
                <div className="cp-cf-trust-sep" />
                <div className="cp-cf-trust-item">
                  <i className="fas fa-shield-alt" />
                  <span>No Commitment</span>
                </div>
              </div>
            </div>
            <div className="cp-cc-card">
              <div className="cp-cc-head-text">
                <h3>
                  Ask Me About
                  <br />
                  Your <em>Health</em>
                </h3>
                <p>
                  Ready to transform? Get in touch with {coach.coachName}{" "}
                  directly.
                </p>
              </div>
              <div className="cp-cc-avatar-circle">
                <CoachPhoto
                  src={coach.photoSrc}
                  alt={coach.coachName}
                  name={coach.coachName}
                />
              </div>
              <div className="cp-cc-name-card">
                <div className="cp-coa-avail">
                  <span className="cp-avail-dot" /> Available Now
                </div>
                <strong>{coach.coachName}</strong>
                <span>{place}</span>
              </div>
              <a
                href={coach.whatsappUrl}
                className="btn cp-btn-whatsapp cp-cc-wa"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp" /> Chat on WhatsApp Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cp-process" id="process">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-route" /> My Process
            </div>
            <h2 className="section-title">How I Coach You</h2>
            <p className="section-subtitle">
              A proven four-step system that takes you from where you are to
              where you want to be.
            </p>
          </div>
          <div className="cp-process-steps">
            {COACHING_PROCESS.map((step, index) => (
              <div className="cp-step" key={step.title}>
                <div className="cp-step-num">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="cp-step-content">
                  <h4 aria-level={3}>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cp-testimonials" id="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-trophy" /> Success Stories
            </div>
            <h2 className="section-title">
              Real Clients, <em>Real Results</em>
            </h2>
            <p className="section-subtitle">
              Hear from people who&apos;ve lived the transformation.
            </p>
          </div>
          {coach.stories.length > 0 ?
            <SuccessStories stories={coach.stories} />
          : <ListEmpty
              title="No client stories yet."
              icon="fas fa-quote-left"
            />
          }
        </div>
      </section>

      {modal ?
        <div
          className="mc-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="mc-modal-box">
            <div className="mc-modal-icon">
              {modal.kind === "success" ?
                <i
                  className="fas fa-check-circle"
                  style={{ color: "#2d6a4f" }}
                />
              : modal.kind === "error" ?
                <i
                  className="fas fa-exclamation-circle"
                  style={{ color: "#c04b2b" }}
                />
              : <i
                  className="fas fa-info-circle"
                  style={{ color: "#c9882a" }}
                />
              }
            </div>
            <h3 className="mc-modal-title">{modal.title}</h3>
            <div className="mc-modal-body">
              {modal.kind === "error" && modal.errors ?
                <ul style={{ paddingLeft: 18, lineHeight: 2 }}>
                  {modal.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              : modal.kind === "success" && modal.enquiry ?
                <>
                  Your enquiry has been sent successfully.
                  <br />
                  <br />
                  We will get back to you within <strong>24 hours</strong>.
                </>
              : "text" in modal ?
                modal.text
              : null}
            </div>
            <button
              type="button"
              className="btn mc-modal-btn"
              onClick={closeModal}
            >
              OK
            </button>
          </div>
        </div>
      : null}
    </div>
  );
}

export function CoachProfileMissing({ message }: { message?: string }) {
  return (
    <div className="mc-public">
      <div
        className="container"
        style={{ padding: "80px 0", textAlign: "center" }}
      >
        <i
          className="fas fa-exclamation-circle"
          style={{ fontSize: 48, color: "#ef4444", marginBottom: 16 }}
        />
        <h2>{message?.trim() ? message : "Coach not found."}</h2>
        <a href="/coach" className="btn mt-3">
          Back to Coach List
        </a>
      </div>
    </div>
  );
}
