import { cacheLife } from "next/cache";
import Link from "next/link";

import type { CoachPublicListItem } from "@/types/coach";

import { HomeCarousel } from "@/components/home/home-carousel";
import { HomeSearch } from "@/components/home/home-search";
import {
  categoryStyle,
  coachBio,
  coachHref,
  coachTypeStyle,
  serviceTags,
  STORY_TEMPLATES,
} from "@/components/home/present";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";
import { fetchCoachCategories } from "@/lib/api/master";
import { resolveMediaUrl } from "@/lib/media/media-url";

function Stars({ rating }: { rating: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon =
          rating >= star ? "fas fa-star"
          : rating >= star - 0.5 ? "fas fa-star-half-alt"
          : "far fa-star";
        return <i key={star} className={`${icon} star`} />;
      })}
    </>
  );
}

function CoachCard({
  coach,
  index,
}: {
  coach: CoachPublicListItem;
  index: number;
}) {
  const style = coachTypeStyle(coach.coachTypeName, index);
  const avatar = resolveMediaUrl(coach.profile_Pic_Url);
  const tags = serviceTags(coach.serviceNames);
  const bio = coachBio(coach.coachDesc, coach.coachTypeName);

  return (
    <div className="coach-card">
      <div className="coach-card-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={style.banner} alt={coach.coachTypeName} />
        <span
          className="coach-category-badge"
          style={{ background: style.color }}
        >
          {coach.coachTypeName}
        </span>
      </div>
      <div className="coach-avatar-wrap">
        {avatar ?
          // eslint-disable-next-line @next/next/no-img-element
          <img className="coach-avatar" src={avatar} alt={coach.coachName} />
        : <div
            className="coach-avatar"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e2e8f0",
              fontSize: 36,
              color: "#94a3b8",
            }}
          >
            <i className="fas fa-user-circle" />
          </div>
        }
        <div className="coach-online" />
      </div>
      <div className="coach-card-body">
        <div className="coach-name">{coach.coachName}</div>
        <div className="coach-specialty" style={{ color: style.color }}>
          {coach.coachTypeName}
        </div>
        <div className="coach-meta">
          <span>
            <Stars rating={coach.rating} /> {coach.rating.toFixed(1)}
          </span>
          {coach.experienceYears > 0 ?
            <span>
              <i className="fas fa-briefcase" /> {coach.experienceYears} Yrs
            </span>
          : null}
          {coach.city_Cd ?
            <span>
              <i className="fas fa-map-marker-alt" /> {coach.city_Cd}
            </span>
          : null}
        </div>
        <p className="coach-bio">{bio}</p>
        {tags.length > 0 ?
          <div className="coach-tags">
            {tags.map((tag) => (
              <span
                key={tag}
                className="coach-tag"
                style={{ background: `${style.color}18`, color: style.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        : null}
        <div className="coach-card-footer">
          {coach.happyClientCount > 0 ?
            <div className="coach-clients">
              Clients: <strong>{coach.happyClientCount}+</strong>
            </div>
          : null}
          <Link href={coachHref(coach)} className="btn btn-primary">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

async function loadCategories() {
  "use cache";
  cacheLife("hours");
  return fetchCoachCategories();
}

async function loadCoaches(page: number) {
  "use cache";
  cacheLife("minutes");
  try {
    const response = await fetchPublicCoaches({ page, pageSize: 6 });
    if (isApiSuccess(response)) return response.responseObj?.items ?? [];
  } catch {
    return [];
  }
  return [];
}

export async function HomeSearchSection() {
  const categories = await loadCategories();
  return <HomeSearch categories={categories} />;
}

export async function HomeCategories() {
  const categories = await loadCategories();
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-th-large" /> Explore Categories
          </div>
          <h2 className="section-title">Coaching for Every Goal</h2>
          <p className="section-subtitle">
            Whether you want to lose weight, build strength, find inner peace or
            improve your overall lifestyle — we have the right expert for you.
          </p>
        </div>
        <div className="category-grid">
          {categories.length > 0 ?
            categories.map((category, index) => {
              const style = categoryStyle(index);
              return (
                <Link
                  key={category.code}
                  href={`/coach?category=${encodeURIComponent(category.code)}`}
                  className="category-card"
                >
                  <div className={`cat-icon ${style.iconBg}`.trim()}>
                    <i className={category.iconClass || "fas fa-user-tie"} />
                  </div>
                  <h4>{category.label}</h4>
                  <p>
                    {category.description ||
                      "Expert coaching tailored to your goals"}
                  </p>
                  <div
                    className="cat-count"
                    style={{ color: style.countColor }}
                  >
                    Find Coaches ›
                  </div>
                </Link>
              );
            })
          : <p
              style={{
                color: "var(--text-light)",
                gridColumn: "1 / -1",
                textAlign: "center",
              }}
            >
              No coaching categories available right now.
            </p>
          }
        </div>
      </div>
    </section>
  );
}

export async function HomeFeaturedCoaches() {
  const coaches = await loadCoaches(1);

  return (
    <section className="featured-coaches" id="coaches">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-medal" /> Featured Coaches
          </div>
          <h2 className="section-title">Meet Our Top Rated Coaches</h2>
          <p className="section-subtitle">
            Certified, experienced and passionate about helping you achieve your
            wellness goals.
          </p>
        </div>
        {coaches.length === 0 ?
          <p style={{ padding: 32, color: "#8b6553" }}>No coaches found.</p>
        : <HomeCarousel
            total={6}
            interval={3500}
            label="coaches"
            trackClass="coaches-grid"
          >
            {coaches.map((coach, index) => (
              <CoachCard
                key={coach.coachId || coach.coachCode}
                coach={coach}
                index={index}
              />
            ))}
          </HomeCarousel>
        }
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/coach" className="btn btn-outline">
            <i className="fas fa-th-large" /> Browse All 500+ Coaches
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function HomeStories() {
  const stories = (await loadCoaches(2)).slice(0, 6);

  return (
    <section className="testimonials" id="stories">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-quote-left" /> Coach Stories
          </div>
          <h2 className="section-title">What Our Coaches Say</h2>
          <p className="section-subtitle">
            Real coaches, real growth — hear how Mera Coach transformed their
            practice and helped them reach more clients.
          </p>
        </div>
        <HomeCarousel
          total={6}
          interval={4000}
          label="stories"
          trackClass="testimonials-grid"
        >
          {stories.length === 0 ?
            <p style={{ padding: 32, color: "#8b6553" }}>
              No stories available yet.
            </p>
          : stories.map((coach, index) => {
              const story = STORY_TEMPLATES[index];
              if (!story) return null;
              const avatar = resolveMediaUrl(coach.profile_Pic_Url);
              const label =
                coach.city_Cd ?
                  `${coach.coachTypeName}, ${coach.city_Cd}`
                : coach.coachTypeName;
              return (
                <div
                  className="testimonial-card"
                  key={coach.coachId || coach.coachCode}
                >
                  <div className="testimonial-stars">
                    <Stars rating={coach.rating} />
                  </div>
                  <div className="transform-badge">
                    <i className={story.icon} /> {story.badge}
                  </div>
                  <div className="testimonial-quote">&ldquo;</div>
                  <p className="testimonial-text">{story.quote}</p>
                  <div className="testimonial-author">
                    {avatar ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="testimonial-avatar"
                        src={avatar}
                        alt={coach.coachName}
                      />
                    : <div
                        className="testimonial-avatar"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#e2e8f0",
                          fontSize: 22,
                          color: "#94a3b8",
                        }}
                      >
                        <i className="fas fa-user-circle" />
                      </div>
                    }
                    <div className="testimonial-info">
                      <strong>{coach.coachName}</strong>
                      <span>{label}</span>
                    </div>
                    <Link
                      href={coachHref(coach)}
                      className="testi-profile-link"
                      title="View Profile"
                    >
                      <i className="fas fa-external-link-alt" />
                    </Link>
                  </div>
                </div>
              );
            })
          }
        </HomeCarousel>
      </div>
    </section>
  );
}
