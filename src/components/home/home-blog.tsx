import { BLOG_POSTS, BLOG_SECTION } from "@/constants/home";

export function HomeBlog() {
  return (
    <section className="blog" id="blog">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <i className="fas fa-pen-fancy" /> {BLOG_SECTION.tag}
          </div>
          <h2 className="section-title">{BLOG_SECTION.title}</h2>
          <p className="section-subtitle">{BLOG_SECTION.subtitle}</p>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <div key={post.title} className="blog-card">
              <div className="blog-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
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
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{post.authorName}</span>
                  <span className="blog-read">{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
