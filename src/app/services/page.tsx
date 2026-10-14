import Link from "next/link";

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
                <div className="sv-ic-card sv-ic-1">
                  <div className="sv-ic-icon">
                    <i className="fas fa-dumbbell" />
                  </div>
                  <strong>Exercise Program</strong>
                  <span>Tailored workout plans</span>
                </div>
                <div className="sv-ic-card sv-ic-2">
                  <div className="sv-ic-icon">
                    <i className="fas fa-apple-alt" />
                  </div>
                  <strong>Nutrition Plans</strong>
                  <span>Certified nutritionists</span>
                </div>
                <div className="sv-ic-card sv-ic-3">
                  <div className="sv-ic-icon">
                    <i className="fas fa-utensils" />
                  </div>
                  <strong>Diet Program</strong>
                  <span>Science-backed diets</span>
                </div>
                <div className="sv-ic-card sv-ic-4">
                  <div className="sv-ic-icon">
                    <i className="fas fa-id-card" />
                  </div>
                  <strong>Client Profiles</strong>
                  <span>Detailed health records</span>
                </div>
                <div className="sv-ic-card sv-ic-5">
                  <div className="sv-ic-icon">
                    <i className="fas fa-heartbeat" />
                  </div>
                  <strong>Health Data</strong>
                  <span>Assessments &amp; tracking</span>
                </div>
                <div className="sv-ic-card sv-ic-6">
                  <div className="sv-ic-icon">
                    <i className="fas fa-chart-bar" />
                  </div>
                  <strong>Reports</strong>
                  <span>Recommendations &amp; insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sv-quicknav">
        <div className="container">
          <div className="sv-qn-list">
            <a href="#exercise" className="sv-qn-item">
              <i className="fas fa-dumbbell" /> Exercise Program
            </a>
            <a href="#nutrition" className="sv-qn-item">
              <i className="fas fa-apple-alt" /> Nutrition Plans
            </a>
            <a href="#diet" className="sv-qn-item">
              <i className="fas fa-utensils" /> Diet Program
            </a>
            <a href="#profiles" className="sv-qn-item">
              <i className="fas fa-id-card" /> Client Profiles
            </a>
            <a href="#assessments" className="sv-qn-item">
              <i className="fas fa-heartbeat" /> Health Assessments
            </a>
            <a href="#reports" className="sv-qn-item">
              <i className="fas fa-chart-bar" /> Reports
            </a>
          </div>
        </div>
      </div>

      <section className="sv-programs" id="coaching">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-fire-alt" /> Coaching Programs
            </div>
            <h2 className="section-title">
              Expert-Led Coaching <em>Programs</em>
            </h2>
            <p className="section-subtitle">
              Science-backed programs crafted by India&apos;s top certified
              coaches, tailored precisely to your body, goals, and lifestyle.
            </p>
          </div>
          <div className="sv-prog-grid">
            <div className="sv-prog-card" id="exercise">
              <div className="sv-pc-header sv-pc-green">
                <div className="sv-pc-icon-wrap">
                  <i className="fas fa-dumbbell" />
                </div>
                <div className="sv-pc-head-text">
                  <span className="sv-pc-label">Program 01</span>
                  <h3>Exercise Program</h3>
                </div>
              </div>
              <div className="sv-pc-body">
                <p className="sv-pc-desc">
                  Structured, progressive workout plans designed to your fitness
                  level, whether you&apos;re a complete beginner or a seasoned
                  athlete.
                </p>
                <ul className="sv-pc-features">
                  <li>
                    <i className="fas fa-check-circle sv-check-green" /> Custom
                    workout plans by certified fitness trainers
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-green" />{" "}
                    Progressive overload &amp; periodisation schedules
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-green" /> Home,
                    gym &amp; hybrid training options
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-green" /> Video
                    demonstrations &amp; form guidance
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-green" /> Weekly
                    programme adjustments based on progress
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-green" /> Injury
                    prevention &amp; mobility protocols
                  </li>
                </ul>
                <div className="sv-pc-tags">
                  <span>Strength</span>
                  <span>Fat Loss</span>
                  <span>HIIT</span>
                  <span>Cardio</span>
                  <span>Functional</span>
                </div>
              </div>
              <div className="sv-pc-footer">
                <Link href="/coach" className="btn sv-pc-btn sv-pcbtn-green">
                  <i className="fas fa-user-check" /> Find a Fitness Coach
                </Link>
              </div>
            </div>

            <div className="sv-prog-card" id="nutrition">
              <div className="sv-pc-header sv-pc-gold">
                <div className="sv-pc-icon-wrap">
                  <i className="fas fa-apple-alt" />
                </div>
                <div className="sv-pc-head-text">
                  <span className="sv-pc-label">Program 02</span>
                  <h3>Nutrition Plans</h3>
                </div>
              </div>
              <div className="sv-pc-body">
                <p className="sv-pc-desc">
                  Personalised meal plans crafted by certified nutritionists to
                  fuel your training, support recovery, and help you build
                  sustainable eating habits.
                </p>
                <ul className="sv-pc-features">
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" /> Custom
                    macro &amp; calorie targets per body type
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" /> Weekly
                    meal plans with simple Indian recipes
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" />{" "}
                    Supplement guidance &amp; timing protocols
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" />{" "}
                    Hydration &amp; micronutrient planning
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" /> Food
                    preference &amp; allergy accommodation
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-gold" />{" "}
                    Vegetarian, vegan &amp; regional diet options
                  </li>
                </ul>
                <div className="sv-pc-tags">
                  <span>Muscle Gain</span>
                  <span>Weight Loss</span>
                  <span>Macros</span>
                  <span>Indian Diet</span>
                  <span>Vegan</span>
                </div>
              </div>
              <div className="sv-pc-footer">
                <Link href="/coach" className="btn sv-pc-btn sv-pcbtn-gold">
                  <i className="fas fa-user-check" /> Find a Nutritionist
                </Link>
              </div>
            </div>

            <div className="sv-prog-card" id="diet">
              <div className="sv-pc-header sv-pc-red">
                <div className="sv-pc-icon-wrap">
                  <i className="fas fa-utensils" />
                </div>
                <div className="sv-pc-head-text">
                  <span className="sv-pc-label">Program 03</span>
                  <h3>Diet Program</h3>
                </div>
              </div>
              <div className="sv-pc-body">
                <p className="sv-pc-desc">
                  Condition-specific and goal-oriented dietary programmes backed
                  by clinical nutrition science, for weight management, gut
                  health, heart wellness, skin &amp; beyond.
                </p>
                <ul className="sv-pc-features">
                  <li>
                    <i className="fas fa-check-circle sv-check-red" /> Weight
                    management &amp; body recomposition plans
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-red" /> Digestive
                    &amp; gut health protocols
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-red" />{" "}
                    Heart-healthy &amp; cholesterol-lowering diets
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-red" /> Diabetic
                    &amp; medical condition diet support
                  </li>
                  <li>
                    <i className="fas fa-check-circle sv-check-red" />{" "}
                    Anti-inflammatory &amp; longevity protocols
                  </li>
                </ul>
                <div className="sv-pc-tags">
                  <span>Gut Health</span>
                  <span>Diabetes</span>
                  <span>Heart</span>
                  <span>Hormonal</span>
                </div>
              </div>
              <div className="sv-pc-footer">
                <Link href="/coach" className="btn sv-pc-btn sv-pcbtn-red">
                  <i className="fas fa-user-check" /> Find a Diet Coach
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <Link href="/coach" className="btn sv-btn-outline">
                  <i className="fas fa-search" /> Find a Coach
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
    </div>
  );
}
