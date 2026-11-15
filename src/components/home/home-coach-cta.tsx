import { Fragment } from "react";
import Link from "next/link";

import { COACH_CTA } from "@/constants/home";
import { PHOTOS, unsplash } from "@/constants/images";

/** The closing call to action for coaches. */
export function HomeCoachCta() {
  const { primaryCta, secondaryCta } = COACH_CTA;

  return (
    <section className="coach-cta">
      <div className="container">
        <div className="coach-cta-inner">
          <div>
            <div className="section-tag coach-cta-tag">
              <i className="fas fa-rocket" /> {COACH_CTA.tag}
            </div>
            <h2 className="coach-cta-title">
              {COACH_CTA.titleLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ?
                    <br />
                  : null}
                  {line}
                </Fragment>
              ))}
            </h2>
            <p className="coach-cta-desc">{COACH_CTA.description}</p>
            <div className="coach-cta-perks">
              {COACH_CTA.perks.map((perk) => (
                <div key={perk} className="cta-perk">
                  <i className="fas fa-check-circle" /> {perk}
                </div>
              ))}
            </div>
            <div className="cta-actions">
              <Link href={primaryCta.href} className="btn btn-white">
                <i className="fas fa-user-tie" /> {primaryCta.label}
              </Link>
              <Link href={secondaryCta.href} className="btn btn-outline-white">
                {secondaryCta.label} <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>
          <div className="cta-right-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={unsplash(PHOTOS.coachCta, { width: 400 })}
              alt={COACH_CTA.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
