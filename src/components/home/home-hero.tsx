import { Fragment } from "react";
import Link from "next/link";

import { HOME_HERO, PROOF_AVATARS } from "@/constants/home";
import { PHOTOS, unsplash } from "@/constants/images";

const STAR_COUNT = 5;

export function HomeHero() {
  const { badge, primaryCta, secondaryCta, proof, floats } = HOME_HERO;

  return (
    <section className="hero" id="home">
      <div className="hero-shapes">
        <div className="hero-shape hero-shape-1" />
        <div className="hero-shape hero-shape-2" />
        <div className="hero-shape hero-shape-3" />
      </div>
      <div className="container">
        <div className="hero-left">
          <div className="hero-badge">
            <span />
            {badge}
          </div>
          <h1 className="hero-title">
            {HOME_HERO.titleLines.map((line) => (
              <Fragment key={line}>
                {line}
                <br />
              </Fragment>
            ))}
            <em>{HOME_HERO.titleAccent}</em>
          </h1>
          <p className="hero-subtitle">{HOME_HERO.subtitle}</p>
          <div className="hero-ctas">
            <Link href={primaryCta.href} className="btn btn-gold">
              <i className="fas fa-user-tie" /> {primaryCta.label}
            </Link>
            <Link href={secondaryCta.href} className="btn btn-outline-white">
              <i className="fas fa-search" /> {secondaryCta.label}
            </Link>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              {PROOF_AVATARS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} className="proof-avatar" src={src} alt="" />
              ))}
            </div>
            <div className="proof-text">
              <strong>{proof.coaches}</strong>
              <span>{proof.coachesNote}</span>
            </div>
            <div className="proof-divider" />
            <div className="proof-rating">
              <div className="proof-stars">
                {Array.from({ length: STAR_COUNT }, (_, index) => (
                  <i key={index} className="fas fa-star" />
                ))}
              </div>
              <span>{proof.rating}</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card-main">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={unsplash(PHOTOS.hero)}
              alt={HOME_HERO.imageAlt}
              fetchPriority="high"
            />
          </div>
          <div className="hero-float-card hero-float-1">
            <div className="float-icon green">
              <i className="fas fa-user-tie" />
            </div>
            <div className="float-text">
              <strong>{floats.coaches.title}</strong>
              <span>{floats.coaches.note}</span>
            </div>
          </div>
          <div className="hero-float-card hero-float-2">
            <div className="float-icon orange">
              <i className="fas fa-chart-line" />
            </div>
            <div className="float-text">
              <strong>{floats.clients.title}</strong>
              <span>{floats.clients.note}</span>
            </div>
          </div>
          <div className="hero-float-card hero-float-3">
            <strong className="float-top-title">{floats.top.title}</strong>
            <div className="float-avatars">
              {PROOF_AVATARS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} className="float-avatar" src={src} alt="" />
              ))}
            </div>
            <span className="float-top-note">{floats.top.note}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
