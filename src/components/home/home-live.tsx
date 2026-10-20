import { cacheLife } from "next/cache";
import Link from "next/link";

import type { CoachPublicListItem } from "@/types/coach";

import { CoachPhoto } from "@/components/coach-photo";
import { HomeCarousel } from "@/components/home/home-carousel";
import { HomeSearch } from "@/components/home/home-search";
import {
  categoryStyle,
  coachBio,
  coachHref,
  coachTypeStyle,
  serviceTags,
} from "@/components/home/present";
import { ListEmpty } from "@/components/list-empty";
import { Stars } from "@/components/stars";
import { FALLBACK_STORIES, STORY_TEMPLATES } from "@/constants/home-stories";
import { fetchPublicCoaches, isApiSuccess } from "@/lib/api";
import { fetchCoachCategories } from "@/lib/api/master";
import { resolveMediaUrl } from "@/lib/media/media-url";

function CoachCard({
  coach,
  index,
}: {
  coach: CoachPublicListItem;
  index: number;
}) {
  const style = coachTypeStyle(coach.coachTypeName, index);
  const avatar = resolveMediaUrl(coach.profile_Pic_Url);
  // The coach's own cover first; the category picture is only a fallback.
  const banner = resolveMediaUrl(coach.cover_Url) || style.banner;
  const tags = serviceTags(coach.serviceNames);
  const bio = coachBio(coach.coachDesc, coach.coachTypeName);

  return (
    <div className="coach-card">
      <div className="coach-card-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner} alt={coach.coachTypeName} />
        <span
          className="coach-category-badge"
          style={{ background: style.color }}
        >
          {coach.coachTypeName}
        </span>
      </div>
      <div className="coach-avatar-wrap">
        <div className="coach-avatar coach-avatar-frame">
          <CoachPhoto
            src={avatar}
            alt={coach.coachName}
            name={coach.coachName}
          />
        </div>
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
            improve your overall lifestyle, we have the right expert for you.
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
                  <h4 aria-level={3}>{category.label}</h4>
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
          <ListEmpty title="No coaches found." icon="fas fa-user-tie" />
        : <HomeCarousel
            total={coaches.length}
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
            <i className="fas fa-th-large" /> Browse All Coaches
          </Link>
        </div>
      </div>
    </section>
  );
}

export async function HomeStories() {
  const coaches = await loadCoaches(2);
  const items =
    coaches.length > 0 ?
      coaches.slice(0, 6).map((c, i) => {
        const tpl = STORY_TEMPLATES[i % STORY_TEMPLATES.length]!;
        const avatar = resolveMediaUrl(c.profile_Pic_Url);
        const label = [c.coachTypeName, c.city_Cd].filter(Boolean).join(", ");
        return {
          coachName: c.coachName,
          coachCode: c.coachCode,
          label: label || c.coachTypeName || "Certified Coach",
          avatar,
          rating: c.rating || 5,
          badge: tpl.badge,
          icon: tpl.icon,
          quote: tpl.quote,
        };
      })
    : FALLBACK_STORIES.map((f, i) => {
        const tpl = STORY_TEMPLATES[i % STORY_TEMPLATES.length]!;
        return {
          ...f,
          badge: tpl.badge,
          icon: tpl.icon,
          quote: tpl.quote,
        };
      });

  return (
    <section className="testimonials" id="stories">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-quote-left" /> Coach Stories
          </div>
          <h2 className="section-title">What Our Coaches Say</h2>
          <p className="section-subtitle">
            Real coaches, real growth. Hear how Mera Coach transformed their
            practice and helped them reach more clients.
          </p>
        </div>
        <HomeCarousel
          total={items.length}
          interval={4000}
          label="stories"
          trackClass="testimonials-grid"
        >
          {items.map((story) => (
            <div key={story.coachCode} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <i
                    key={starIndex}
                    className={
                      starIndex < Math.round(story.rating || 5) ?
                        "fas fa-star"
                      : "far fa-star"
                    }
                  />
                ))}
              </div>
              <div className="transform-badge">
                <i className={story.icon} /> {story.badge}
              </div>
              <div className="testimonial-quote">&ldquo;</div>
              <p className="testimonial-text">{story.quote}</p>
              <div className="testimonial-author">
                {story.avatar ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="testimonial-avatar"
                    src={story.avatar}
                    alt={story.coachName}
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
                  <strong>{story.coachName}</strong>
                  <span>{story.label}</span>
                </div>
                <Link
                  href={`/coach/${encodeURIComponent(story.coachCode)}`}
                  className="testi-profile-link"
                  title="View Profile"
                >
                  <i className="fas fa-external-link-alt" />
                </Link>
              </div>
            </div>
          ))}
        </HomeCarousel>
      </div>
    </section>
  );
}
