import Link from "next/link";

import { ServicePrograms } from "@/components/services/service-programs";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Coaching Programs and Practice Tools | Mera Coach",
  description:
    "Exercise and nutrition programs for clients, plus client profiles, assessments and reports for coaches. See everything Mera Coach offers.",
  path: "/services",
  absolute: true,
});

export default function ServicesPage() {
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
                <Link href="/">Home</Link>
                <i className="fas fa-chevron-right" />
                <span>Our Services</span>
              </nav>
              <div className="section-tag sv-hero-tag">
                <i className="fas fa-th-large" /> What We Offer
              </div>
              <h1 className="sv-hero-title">
                Complete Health &amp;
                <br />
                Coaching <em>Services</em>
              </h1>
              <p className="sv-hero-sub">
                From personalised exercise programs to in-depth nutrition plans,
                smart client profiling, detailed health assessments and
                data-driven reports, everything you need to transform your
                coaching practice or reach your wellness goals.
              </p>
              <div className="sv-hero-btns">
                <Link href="/coach" className="btn sv-btn-book">
                  <i className="fas fa-search" /> Find a Coach
                </Link>
                <a href="#coaching" className="btn sv-btn-outline">
                  <i className="fas fa-layer-group" /> Explore Services
                </a>
              </div>
              <div className="sv-hero-trust">
                <div className="sv-trust-item">
                  <i className="fas fa-shield-alt" />
                  <span>100% Verified Coaches</span>
                </div>
                <div className="sv-trust-sep" />
                <div className="sv-trust-item">
                  <i className="fas fa-users" />
                  <span>10,000+ Active Clients</span>
                </div>
                <div className="sv-trust-sep" />
                <div className="sv-trust-item">
                  <i className="fas fa-star" />
                  <span>4.8 Platform Rating</span>
                </div>
              </div>
            </div>
            <div className="sv-hero-visual">
              <div className="sv-icon-grid">
                <a href="#exercise" className="sv-ic-card sv-ic-1">
                  <div className="sv-ic-icon">
                    <i className="fas fa-dumbbell" />
                  </div>
                  <strong>Exercise Program</strong>
                  <span>Tailored workout plans</span>
                </a>
                <a href="#nutrition" className="sv-ic-card sv-ic-2">
                  <div className="sv-ic-icon">
                    <i className="fas fa-apple-alt" />
                  </div>
                  <strong>Nutrition Plans</strong>
                  <span>Certified nutritionists</span>
                </a>
                <a href="#diet" className="sv-ic-card sv-ic-3">
                  <div className="sv-ic-icon">
                    <i className="fas fa-utensils" />
                  </div>
                  <strong>Diet Program</strong>
                  <span>Science-backed diets</span>
                </a>
                <a href="#profiles" className="sv-ic-card sv-ic-4">
                  <div className="sv-ic-icon">
                    <i className="fas fa-id-card" />
                  </div>
                  <strong>Client Profiles</strong>
                  <span>Detailed health records</span>
                </a>
                <a href="#assessments" className="sv-ic-card sv-ic-5">
                  <div className="sv-ic-icon">
                    <i className="fas fa-heartbeat" />
                  </div>
                  <strong>Health Data</strong>
                  <span>Assessments &amp; tracking</span>
                </a>
                <a href="#reports" className="sv-ic-card sv-ic-6">
                  <div className="sv-ic-icon">
                    <i className="fas fa-chart-bar" />
                  </div>
                  <strong>Reports</strong>
                  <span>Recommendations &amp; insights</span>
                </a>
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
              <i className="fas fa-cogs" /> Platform Tools
            </div>
            <h2 className="section-title">
              Smart Client <em>Management Tools</em>
            </h2>
            <p className="section-subtitle">
              Powerful tools for coaches to track, manage and grow their
              clients. Every detail, every data point, every insight, in one
              place.
            </p>
          </div>
          <div className="sv-tools-grid">
            <div className="sv-tool-card" id="profiles">
              <div className="sv-tc-accent sv-tca-green" />
              <div className="sv-tc-num">01</div>
              <div className="sv-tc-icon sv-tci-green">
                <i className="fas fa-id-card" />
              </div>
              <h3>Detailed Client Profiles</h3>
              <p>
                Comprehensive digital records for every client, personal
                details, health history, coaching notes, session logs, and
                progress photos, all in one secure place.
              </p>
              <ul className="sv-tc-list">
                <li>
                  <i className="fas fa-check" /> Personal info, goals &amp;
                  preferences
                </li>
                <li>
                  <i className="fas fa-check" /> Complete health &amp; injury
                  history
                </li>
                <li>
                  <i className="fas fa-check" /> Coaching notes &amp; session
                  logs
                </li>
                <li>
                  <i className="fas fa-check" /> Progress photo timeline storage
                </li>
              </ul>
              <Link href="/register" className="sv-tc-link sv-tcl-green">
                <i className="fas fa-arrow-right" /> Learn More
              </Link>
            </div>
            <div className="sv-tool-card sv-tool-featured" id="assessments">
              <div className="sv-tc-accent sv-tca-gold" />
              <div className="sv-tc-num sv-tc-num-light">02</div>
              <div className="sv-tc-icon sv-tci-gold">
                <i className="fas fa-heartbeat" />
              </div>
              <h3>Health Data &amp; Assessments</h3>
              <p>
                Record and monitor every vital metric that matters. From body
                composition and fitness evaluations to lifestyle analysis, build
                a complete health baseline for each client.
              </p>
              <ul className="sv-tc-list">
                <li>
                  <i className="fas fa-check" /> Body composition &amp; BMI
                  analysis
                </li>
                <li>
                  <i className="fas fa-check" /> Vital signs &amp; health
                  markers monitoring
                </li>
                <li>
                  <i className="fas fa-check" /> Fitness level &amp; VO2 max
                  evaluation
                </li>
                <li>
                  <i className="fas fa-check" /> Sleep, stress &amp; lifestyle
                  analysis
                </li>
              </ul>
              <Link href="/register" className="sv-tc-link sv-tcl-gold">
                <i className="fas fa-arrow-right" /> Learn More
              </Link>
            </div>
            <div className="sv-tool-card" id="reports">
              <div className="sv-tc-accent sv-tca-red" />
              <div className="sv-tc-num">03</div>
              <div className="sv-tc-icon sv-tci-red">
                <i className="fas fa-chart-bar" />
              </div>
              <h3>Reports &amp; Recommendations</h3>
              <p>
                Transform raw health data into actionable insights. Generate
                comprehensive progress reports, share them with clients, and
                make data-driven decisions to accelerate results.
              </p>
              <ul className="sv-tc-list">
                <li>
                  <i className="fas fa-check" /> Automated monthly progress
                  reports
                </li>
                <li>
                  <i className="fas fa-check" /> Visual charts &amp; trend
                  analysis
                </li>
                <li>
                  <i className="fas fa-check" /> AI-powered improvement
                  suggestions
                </li>
                <li>
                  <i className="fas fa-check" /> Shareable PDF &amp; digital
                  reports
                </li>
              </ul>
              <Link href="/register" className="sv-tc-link sv-tcl-red">
                <i className="fas fa-arrow-right" /> Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sv-final-cta sv-cta">
        <div className="container">
          <div className="sv-fca-inner sv-cta-inner">
            <div className="sv-fca-left sv-cta-text">
              <div className="section-tag sv-fca-tag sv-cta-tag">
                <i className="fas fa-rocket" /> Get Started Today
              </div>
              <h2>
                Ready to Transform Your
                <br />
                <em>Coaching Practice?</em>
              </h2>
              <p>
                Join 500+ coaches who are already using Mera Coach to manage
                clients, deliver better results and grow their business.
              </p>
              <div className="sv-fca-btns sv-cta-btns">
                <Link href="/register" className="btn sv-btn-book">
                  <i className="fas fa-user-tie" /> Register as a Coach
                </Link>
              </div>
            </div>
            <div className="sv-fca-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=80"
                alt="Coaching Practice"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="sv-final-cta sv-cta sv-member-cta">
        <div className="container">
          <div className="sv-fca-inner sv-cta-inner">
            <div className="sv-fca-left sv-cta-text">
              <div className="section-tag sv-fca-tag sv-cta-tag">
                <i className="fas fa-heart" /> For Members
              </div>
              <h2>
                Ready for a
                <br />
                <em>Healthier You?</em>
              </h2>
              <p>
                Connect with expert coaches for fitness, nutrition, mental
                wellness, and lasting lifestyle transformation.
              </p>
              <div className="sv-fca-btns sv-cta-btns">
                <Link href="/coach" className="btn sv-btn-book">
                  <i className="fas fa-search" /> Find a Coach
                </Link>
              </div>
            </div>
            <div className="sv-fca-right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80"
                alt="Yoga and wellness"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
