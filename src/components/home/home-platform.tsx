import { Fragment } from "react";
import Link from "next/link";

import type { Benefit } from "@/constants/home-platform";

import {
  COACH_BENEFITS,
  HOW_IT_WORKS,
  PLATFORM_SECTION,
  WELLNESS_BENEFITS,
} from "@/constants/home-platform";

function BenefitCard({ icon, tone, title, text }: Benefit) {
  return (
    <div className="feature-card">
      <div className={`feature-icon-wrap fi-${tone}`}>
        <i className={icon} />
      </div>
      <h3>{title}</h3>
      <p>
        {text.map((part, index) =>
          typeof part === "string" ?
            <Fragment key={index}>{part}</Fragment>
          : <strong key={index}>{part.strong}</strong>,
        )}
      </p>
    </div>
  );
}

/** Platform benefits: the coach tools first, then the health and wellness benefits clients get. */
export function HomePlatformFeatures() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-layer-group" /> {PLATFORM_SECTION.tag}
          </div>
          <h2 className="section-title">{PLATFORM_SECTION.title}</h2>
          <p className="section-subtitle">{PLATFORM_SECTION.subtitle}</p>
        </div>

        <p className="features-group-title">
          <i className="fas fa-briefcase" /> {PLATFORM_SECTION.coachGroup}
        </p>
        <div className="features-grid">
          {COACH_BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>

        <p className="features-group-title">
          <i className="fas fa-heartbeat" /> {PLATFORM_SECTION.wellnessGroup}
        </p>
        <div className="features-grid">
          {WELLNESS_BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeHowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-route" /> {HOW_IT_WORKS.tag}
          </div>
          <h2 className="section-title">{HOW_IT_WORKS.title}</h2>
          <p className="section-subtitle">{HOW_IT_WORKS.subtitle}</p>
        </div>
        <div className="steps-grid">
          {HOW_IT_WORKS.steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <div className="step-num">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
        <div className="steps-cta">
          <Link href={HOW_IT_WORKS.cta.href} className="btn btn-gold">
            <i className="fas fa-user-tie" /> {HOW_IT_WORKS.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
