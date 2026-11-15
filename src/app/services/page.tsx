import { Fragment } from "react";
import Link from "next/link";

import { ServicePrograms } from "@/components/services/service-programs";
import { siteConfig } from "@/config/site";
import { PHOTOS, unsplash } from "@/constants/images";
import {
  SERVICE_CTAS,
  SERVICE_PROGRAMS,
  SERVICE_TOOLS,
  SERVICE_TOOLS_SECTION,
  SERVICES_HERO,
  SERVICES_SEO,
} from "@/constants/services-programs";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  ...SERVICES_SEO,
  path: siteConfig.links.services,
  absolute: true,
});

/** The six tiles in the hero: the three programmes, then the three practice tools. Each links to its details. */
const HERO_TILES = [
  ...SERVICE_PROGRAMS.map((program) => ({
    id: program.id,
    icon: program.icon,
    title: program.title,
    caption: program.tagline,
  })),
  ...SERVICE_TOOLS.map((tool) => ({
    id: tool.id,
    icon: tool.icon,
    title: tool.tileTitle,
    caption: tool.tileCaption,
  })),
];

/** The photo beside each closing block. */
const CTA_PHOTOS = {
  coach: PHOTOS.servicesCoachCta,
  member: PHOTOS.servicesMemberCta,
} as const;

export default function ServicesPage() {
  const { primaryCta, secondaryCta } = SERVICES_HERO;

  return (
    <div className="mc-public">
      <section className="sv-hero">
        <div className="sv-hero-shapes">
          <div className="sv-hs sv-hs-1" />
          <div className="sv-hs sv-hs-2" />
          <div className="sv-hs sv-hs-3" />
        </div>
        <div className="container">
          <div className="sv-hero-grid">
            <div className="sv-hero-text">
              <nav className="sv-breadcrumb" aria-label="Breadcrumb">
                <Link href={siteConfig.links.home}>Home</Link>
                <i className="fas fa-chevron-right" />
                <span>{SERVICES_HERO.breadcrumb}</span>
              </nav>
              <div className="section-tag sv-hero-tag">
                <i className="fas fa-th-large" /> {SERVICES_HERO.tag}
              </div>
              <h1 className="sv-hero-title">
                {SERVICES_HERO.titleLines.map((line) => (
                  <Fragment key={line}>
                    {line}
                    <br />
                  </Fragment>
                ))}
                <em>{SERVICES_HERO.titleAccent}</em>
              </h1>
              <p className="sv-hero-sub">{SERVICES_HERO.subtitle}</p>
              <div className="sv-hero-btns">
                <Link href={primaryCta.href} className="btn sv-btn-book">
                  <i className="fas fa-search" /> {primaryCta.label}
                </Link>
                <a href={secondaryCta.href} className="btn sv-btn-outline">
                  <i className="fas fa-layer-group" /> {secondaryCta.label}
                </a>
              </div>
              <div className="sv-hero-trust">
                {SERVICES_HERO.trust.map((item, index) => (
                  <Fragment key={item.text}>
                    {index > 0 ?
                      <div className="sv-trust-sep" />
                    : null}
                    <div className="sv-trust-item">
                      <i className={item.icon} />
                      <span>{item.text}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="sv-hero-visual">
              <div className="sv-icon-grid">
                {HERO_TILES.map((tile, index) => (
                  <a
                    key={tile.id}
                    href={`#${tile.id}`}
                    className={`sv-ic-card sv-ic-${index + 1}`}
                  >
                    <div className="sv-ic-icon">
                      <i className={tile.icon} />
                    </div>
                    <strong>{tile.title}</strong>
                    <span>{tile.caption}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServicePrograms />

      <section className="sv-platform" id="platform">
        <div className="container">
          <div className="section-header">
            <div className="section-tag sv-tag-green">
              <i className="fas fa-cogs" /> {SERVICE_TOOLS_SECTION.tag}
            </div>
            <h2 className="section-title">
              {SERVICE_TOOLS_SECTION.title}{" "}
              <em>{SERVICE_TOOLS_SECTION.titleAccent}</em>
            </h2>
            <p className="section-subtitle">{SERVICE_TOOLS_SECTION.subtitle}</p>
          </div>
          <div className="sv-tools-grid">
            {SERVICE_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className={
                  tool.featured ?
                    "sv-tool-card sv-tool-featured"
                  : "sv-tool-card"
                }
                id={tool.id}
              >
                <div className={`sv-tc-accent sv-tca-${tool.tone}`} />
                <div
                  className={
                    tool.featured ? "sv-tc-num sv-tc-num-light" : "sv-tc-num"
                  }
                >
                  {tool.num}
                </div>
                <div className={`sv-tc-icon sv-tci-${tool.tone}`}>
                  <i className={tool.icon} />
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <ul className="sv-tc-list">
                  {tool.points.map((point) => (
                    <li key={point}>
                      <i className="fas fa-check" /> {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={SERVICE_TOOLS_SECTION.cardLink.href}
                  className={`sv-tc-link sv-tcl-${tool.tone}`}
                >
                  <i className="fas fa-arrow-right" />{" "}
                  {SERVICE_TOOLS_SECTION.cardLink.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {SERVICE_CTAS.map((cta) => (
        <section
          key={cta.key}
          className={
            cta.key === "member" ?
              "sv-final-cta sv-cta sv-member-cta"
            : "sv-final-cta sv-cta"
          }
        >
          <div className="container">
            <div className="sv-fca-inner sv-cta-inner">
              <div className="sv-fca-left sv-cta-text">
                <div className="section-tag sv-fca-tag sv-cta-tag">
                  <i className={cta.tagIcon} /> {cta.tag}
                </div>
                <h2>
                  {cta.titleLine}
                  <br />
                  <em>{cta.titleAccent}</em>
                </h2>
                <p>{cta.text}</p>
                <div className="sv-fca-btns sv-cta-btns">
                  <Link href={cta.button.href} className="btn sv-btn-book">
                    <i className={cta.button.icon} /> {cta.button.label}
                  </Link>
                </div>
              </div>
              <div className="sv-fca-right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={unsplash(CTA_PHOTOS[cta.key], { width: 500 })}
                  alt={cta.photoAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
