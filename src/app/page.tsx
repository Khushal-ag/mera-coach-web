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
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata({
  title: "Mera Coach | Find Verified Health, Fitness & Wellness Coaches",
  description:
    "Mera Coach connects you with verified health, fitness, yoga and nutrition coaches, and gives coaches the tools to manage clients and grow their practice.",
  path: "/",
  absolute: true,
});

const PROOF = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
];

const BLOG_POSTS = [
  {
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Nutrition Blog",
    category: "Nutrition",
    categoryStyle: undefined,
    date: "May 20, 2026",
    title: "10 Superfoods That Can Transform Your Health in 30 Days",
    summary:
      "Discover science-backed superfoods that your nutrition coach recommends for improved energy, immunity and overall wellness...",
    authorAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    authorName: "Dr. Ananya Singh",
    readTime: "5 min read",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Yoga Blog",
    category: "Yoga",
    categoryStyle: { background: "#f3e8ff", color: "#9333ea" },
    date: "May 18, 2026",
    title: "Morning Yoga Routine: 15 Minutes to a Productive Day",
    summary:
      "Start your day right with this expert-designed morning yoga sequence that boosts energy, reduces anxiety and sharpens focus...",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    authorName: "Priya Mehta",
    readTime: "4 min read",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80",
    imageAlt: "Fitness Blog",
    category: "Fitness",
    categoryStyle: { background: "#fdf3e0", color: "#c9882a" },
    date: "May 15, 2026",
    title: "Beginner's Guide to Starting Your Fitness Journey at Any Age",
    summary:
      "Whether you're 25 or 65, it's never too late or too early. Here's your complete beginner-friendly guide to getting fit...",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    authorName: "Rahul Sharma",
    readTime: "6 min read",
  },
];

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
              Manage clients, track progress and build your coaching brand
              &mdash; all in one powerful platform designed for health coaches.
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
                {PROOF.map((src) => (
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
                {PROOF.map((src) => (
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

      <section className="trust-strip">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-num">
                500<span style={{ fontSize: 28 }}>+</span>
              </span>
              <span className="stat-label">Verified Coaches</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">
                25K<span style={{ fontSize: 28 }}>+</span>
              </span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">
                15<span style={{ fontSize: 28 }}>+</span>
              </span>
              <span className="stat-label">Coaching Categories</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">
                4.9<span style={{ fontSize: 28 }}>/5</span>
              </span>
              <span className="stat-label">Average Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">
                10K<span style={{ fontSize: 28 }}>+</span>
              </span>
              <span className="stat-label">Transformations</span>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeCategories />
      </Suspense>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-layer-group" /> Platform Features
            </div>
            <h2 className="section-title">
              Everything You Need to Run Your Coaching Practice
            </h2>
            <p className="section-subtitle">
              One powerful platform with all the tools to manage, grow and
              showcase your coaching business &mdash; so you can focus on what
              matters most: your clients.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap fi-green">
                <i className="fas fa-users" />
              </div>
              <h3>Client Management</h3>
              <p>
                Manage all your clients in one place. Store profiles, track
                check-ups, view history and stay on top of every client&apos;s
                journey with ease.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap fi-blue">
                <i className="fas fa-chart-line" />
              </div>
              <h3>Progress Tracking</h3>
              <p>
                Track health data, BMI, weight, measurements and milestones over
                time. Generate insightful progress reports with a single click.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap fi-gold">
                <i className="fas fa-filter" />
              </div>
              <h3>Lead Management</h3>
              <p>
                Capture incoming leads, track their status and convert them into
                paying clients. Never let a potential client slip through the
                cracks again.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap fi-teal">
                <i className="fas fa-globe" />
              </div>
              <h3>Landing Page</h3>
              <p>
                Get your own professional coaching landing page on Mera Coach.
                Share it, promote it and let your page do the selling for you
                24/7.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap fi-purple">
                <i className="fas fa-trophy" />
              </div>
              <h3>Showcase Success Stories</h3>
              <p>
                Highlight real client transformations on your profile.
                Before-and-after stories build trust and attract serious clients
                to your coaching practice.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap fi-red">
                <i className="fas fa-star" />
              </div>
              <h3>Build Your Personal Brand</h3>
              <p>
                Establish yourself as an authority in your niche. Customise your
                profile, showcase expertise and grow a recognisable coaching
                brand online.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-route" /> How It Works
            </div>
            <h2 className="section-title">
              Start Your Coaching Journey in 3 Simple Steps
            </h2>
            <p className="section-subtitle">
              Getting set up on Mera Coach takes minutes. Here&apos;s how
              coaches go from sign-up to fully running their practice.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Sign Up as a Coach</h3>
              <p>
                Create your coach account and join our growing community in
                minutes. Set your category, credentials and start building your
                presence on India&apos;s #1 coaching platform.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Set Up Your Profile &amp; Services</h3>
              <p>
                Build your personal landing page, define your coaching services
                and upload your success stories. Your profile is your digital
                storefront &mdash; make it shine.
              </p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Start Managing Clients</h3>
              <p>
                Begin adding clients, tracking their progress and managing leads
                &mdash; all from one clean dashboard. Watch your coaching
                practice grow, day by day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeFeaturedCoaches />
      </Suspense>

      <section className="choose-path" id="about">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-compass" /> Who Are You Here For?
            </div>
            <h2 className="section-title">Choose Your Path</h2>
            <p className="section-subtitle">
              Mera Coach serves both coaches and members &mdash; pick your path
              and let us do the rest.
            </p>
          </div>
          <div className="path-grid">
            <div className="path-card path-card-coach">
              <div className="path-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=85"
                  alt="Coach with Nutrition"
                />
              </div>
              <div className="path-overlay" />
              <div className="path-content">
                <div className="path-icon-wrap">
                  <i className="fas fa-user-tie" />
                </div>
                <div className="path-pill path-pill-coach">
                  <i className="fas fa-briefcase" /> For Coaches
                </div>
                <h3>Built for Coaches</h3>
                <p>
                  Run, grow and scale your coaching practice &mdash; from client
                  management to building your personal brand online.
                </p>
                <ul className="path-features">
                  <li>
                    <i className="fas fa-check-circle" /> Manage all clients
                    from one dashboard
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Track health data
                    &amp; client progress
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Capture &amp; convert
                    incoming leads
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Your own professional
                    landing page
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Showcase client
                    success stories
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Build your personal
                    coaching brand
                  </li>
                </ul>
                <Link href="/register" className="path-cta path-cta-coach">
                  <i className="fas fa-rocket" /> Start as a Coach{" "}
                  <i className="fas fa-arrow-right" />
                </Link>
              </div>
            </div>
            <div className="path-card path-card-member">
              <div className="path-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=85"
                  alt="Yoga Wellness"
                />
              </div>
              <div className="path-overlay" />
              <div className="path-content">
                <div className="path-icon-wrap">
                  <i className="fas fa-spa" />
                </div>
                <div className="path-pill path-pill-member">
                  <i className="fas fa-user" /> For Members
                </div>
                <h3>Looking for a Coach?</h3>
                <p>
                  Find the right expert for your health and wellness goals.
                  Connect, consult and transform your life today.
                </p>
                <ul className="path-features">
                  <li>
                    <i className="fas fa-check-circle" /> Explore 500+ verified
                    coaches
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Filter by goal,
                    category &amp; location
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> View real success
                    stories first
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Connect directly &amp;
                    start your journey
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Track progress with
                    your coach
                  </li>
                  <li>
                    <i className="fas fa-check-circle" /> Personalised plans,
                    not generic advice
                  </li>
                </ul>
                <Link href="/coach" className="path-cta path-cta-member">
                  <i className="fas fa-search" /> Find a Coach{" "}
                  <i className="fas fa-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeStories />
      </Suspense>

      <HomeBmi />

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
          <div style={{ textAlign: "center" }}>
            <a href="#" className="btn btn-outline">
              <i className="fas fa-book-open" /> Read All Articles
            </a>
          </div>
        </div>
      </section>

      <HomeAppPromo />

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
                  <i className="fas fa-check-circle" /> Free dedicated landing
                  page
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
