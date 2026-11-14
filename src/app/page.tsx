import { Suspense } from "react";
import Link from "next/link";

import { HomeAppPromo } from "@/components/home/home-app-promo";
import { HomeBmi } from "@/components/home/home-bmi";
import {
  HomeCategories,
  HomeFeaturedCoaches,
  HomeSearchSection,
  HomeStories,
} from "@/components/home/home-live";
import { HomePath } from "@/components/home/home-path";
import {
  HomeHowItWorks,
  HomePlatformFeatures,
} from "@/components/home/home-platform";
import { StatNumber } from "@/components/home/stat-number";
import { BLOG_POSTS, PROOF_AVATARS } from "@/constants/home";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Mera Coach | Find Verified Health, Fitness & Wellness Coaches",
  description:
    "Mera Coach connects you with verified health, fitness, yoga and nutrition coaches, and gives coaches the tools to manage clients and grow their practice.",
  path: "/",
  absolute: true,
});

export default function HomePage() {
  return (
    <div className="mc-public">
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
              India&apos;s #1 Coach Management Platform
            </div>
            <h1 className="hero-title">
              Grow Your
              <br />
              Health Coaching
              <br />
              <em>Business</em>
            </h1>
            <p className="hero-subtitle">
              Manage clients, track progress and build your coaching brand in
              one platform designed for health coaches.
            </p>
            <div className="hero-ctas">
              <Link href="/register" className="btn btn-gold">
                <i className="fas fa-user-tie" /> Start as a Coach
              </Link>
              <Link href="/coach" className="btn btn-outline-white">
                <i className="fas fa-search" /> Find a Coach
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
                <strong>500+ Active Coaches</strong>
                <span>growing their practice</span>
              </div>
              <div className="proof-divider" />
              <div className="proof-rating">
                <div className="proof-stars">
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                  <i className="fas fa-star" />
                </div>
                <span>98% coach satisfaction rate</span>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-card-main">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80"
                alt="Health Coaching"
              />
            </div>
            <div className="hero-float-card hero-float-1">
              <div className="float-icon green">
                <i className="fas fa-user-tie" />
              </div>
              <div className="float-text">
                <strong>500+ Active Coaches</strong>
                <span>Growing their practice</span>
              </div>
            </div>
            <div className="hero-float-card hero-float-2">
              <div className="float-icon orange">
                <i className="fas fa-chart-line" />
              </div>
              <div className="float-text">
                <strong>12K+ Clients Managed</strong>
                <span>Across all categories</span>
              </div>
            </div>
            <div className="hero-float-card hero-float-3">
              <strong
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontSize: 14,
                  color: "#2c1810",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Top Coaches
              </strong>
              <div className="float-avatars">
                {PROOF_AVATARS.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} className="float-avatar" src={src} alt="" />
                ))}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "#8b6553",
                  display: "block",
                  marginTop: 6,
                }}
              >
                +500 verified coaches
              </span>
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="search-section">
            <div className="container">
              <div className="search-box" />
            </div>
          </div>
        }
      >
        <HomeSearchSection />
      </Suspense>

      {/* Choose Your Path comes first; the cards then show the coach or the member sections. */}
      <HomePath
        coachPanel={
          <>
            <HomePlatformFeatures />
            <HomeHowItWorks />
            <HomeAppPromo />
          </>
        }
        memberPanel={
          <>
            <Suspense fallback={null}>
              <HomeFeaturedCoaches />
            </Suspense>
            <Suspense fallback={null}>
              <HomeCategories />
            </Suspense>
            <HomeBmi />
          </>
        }
      />

      <section className="trust-strip">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <StatNumber target={500} unit="+" />
              <span className="stat-label">Verified Coaches</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <StatNumber target={25} inline="K" unit="+" />
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <StatNumber target={15} unit="+" />
              <span className="stat-label">Coaching Categories</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <StatNumber target={4.9} decimals={1} unit="/5" />
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <StatNumber target={10} inline="K" unit="+" />
              <span className="stat-label">Transformations</span>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeStories />
      </Suspense>

      <section className="blog" id="blog">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-pen-fancy" /> Wellness Blog
            </div>
            <h2 className="section-title">
              Tips, Insights &amp; Wellness Wisdom
            </h2>
            <p className="section-subtitle">
              Expert-written articles to help you on your health and wellness
              journey.
            </p>
          </div>
          <div className="blog-grid">
            {BLOG_POSTS.map((post) => (
              <div key={post.title} className="blog-card">
                <div className="blog-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.imageAlt} />
                </div>
                <div className="blog-body">
                  <div className="blog-meta">
                    <span className="blog-cat" style={post.categoryStyle}>
                      {post.category}
                    </span>
                    <span className="blog-date">
                      <i className="fas fa-calendar" /> {post.date}
                    </span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <div className="blog-author">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.authorAvatar} alt={post.authorName} />
                    <span>{post.authorName}</span>
                    <span className="blog-read">{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="coach-cta">
        <div className="container">
          <div className="coach-cta-inner">
            <div>
              <div className="section-tag coach-cta-tag">
                <i className="fas fa-rocket" /> For Coaches
              </div>
              <h2 className="coach-cta-title">
                Grow Your Coaching
                <br />
                Business with Mera Coach
              </h2>
              <p className="coach-cta-desc">
                Join 500+ certified coaches who are growing their wellness
                practice, reaching more clients and building their personal
                brand on India&apos;s fastest growing coaching platform.
              </p>
              <div className="coach-cta-perks">
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> Free business page /
                  personal website
                </div>
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> Client management
                  dashboard
                </div>
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> BMI &amp; assessment
                  tools
                </div>
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> Product recommendations
                </div>
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> Success story showcase
                </div>
                <div className="cta-perk">
                  <i className="fas fa-check-circle" /> Digital marketing
                  support
                </div>
              </div>
              <div className="cta-actions">
                <Link href="/register" className="btn btn-white">
                  <i className="fas fa-user-tie" /> Become a Coach
                </Link>
                <Link href="/services" className="btn btn-outline-white">
                  Explore Features <i className="fas fa-arrow-right" />
                </Link>
              </div>
            </div>
            <div className="cta-right-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=400&auto=format&fit=crop&q=80"
                alt="Coach Dashboard"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
