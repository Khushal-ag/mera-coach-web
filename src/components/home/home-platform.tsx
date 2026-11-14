import Link from "next/link";

type Benefit = {
  icon: string;
  tone: "green" | "blue" | "gold" | "teal" | "purple" | "red";
  title: string;
  text: string;
};

/** What a client gets from health and wellness coaching, shown next to the coach tools. */
const WELLNESS_BENEFITS: Benefit[] = [
  {
    icon: "fas fa-clipboard-list",
    tone: "green",
    title: "Personalised Plans",
    text: "Exercise, nutrition and diet plans built around your body, goals and lifestyle, not generic advice.",
  },
  {
    icon: "fas fa-user-check",
    tone: "blue",
    title: "Expert Guidance",
    text: "Work with verified coaches who answer your questions, adjust your plan as you progress and guide you at every step.",
  },
  {
    icon: "fas fa-bullseye",
    tone: "gold",
    title: "Goals & Motivation",
    text: "Set clear health goals, celebrate every milestone and stay on track with a coach who keeps you accountable.",
  },
  {
    icon: "fas fa-heartbeat",
    tone: "red",
    title: "Better Physical Health",
    text: "Build strength, stamina and flexibility, manage your weight and lower everyday health risks.",
  },
  {
    icon: "fas fa-spa",
    tone: "teal",
    title: "Mental Wellness & Balance",
    text: "Reduce stress, sleep better and find calm and focus through mindful movement and healthy routines.",
  },
  {
    icon: "fas fa-seedling",
    tone: "purple",
    title: "Lasting Lifestyle Change",
    text: "Small, sustainable habits that fit your life, so results last well beyond the first few weeks.",
  },
];

function BenefitCard({ icon, tone, title, text }: Benefit) {
  return (
    <div className="feature-card">
      <div className={`feature-icon-wrap fi-${tone}`}>
        <i className={icon} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
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
            <i className="fas fa-layer-group" /> Platform Features
          </div>
          <h2 className="section-title">
            Everything You Need to Run Your Coaching Practice
          </h2>
          <p className="section-subtitle">
            One platform with all the tools to manage, grow and showcase your
            coaching business, so you can focus on what matters most: your
            clients.
          </p>
        </div>

        <p className="features-group-title">
          <i className="fas fa-briefcase" /> For your coaching business
        </p>
        <div className="features-grid">
          <BenefitCard
            icon="fas fa-users"
            tone="green"
            title="Client Management"
            text="Manage all your clients in one place. Store profiles, track check-ups, view history and stay on top of every client's journey with ease."
          />
          <BenefitCard
            icon="fas fa-chart-line"
            tone="blue"
            title="Progress Tracking"
            text="Track health data, BMI, weight, measurements and milestones over time. Generate insightful progress reports with a single click."
          />
          <div className="feature-card">
            <div className="feature-icon-wrap fi-gold">
              <i className="fas fa-filter" />
            </div>
            <h3>Client Acquisition</h3>
            <p>
              Get discovered by more clients and{" "}
              <strong>
                Grow your coaching business by capturing, nurturing, and
                converting leads into paying clients.
              </strong>{" "}
              Build a predictable client pipeline and never let an opportunity
              slip through the cracks.
            </p>
          </div>
          <BenefitCard
            icon="fas fa-globe"
            tone="teal"
            title="Business Page / Personal Website"
            text="Get your own professional business page (your personal website) on Mera Coach. Share it, promote it and let your page do the selling for you 24/7."
          />
          <BenefitCard
            icon="fas fa-trophy"
            tone="purple"
            title="Showcase Success Stories"
            text="Highlight real client transformations on your profile. Before-and-after stories build trust and attract serious clients to your coaching practice."
          />
          <BenefitCard
            icon="fas fa-star"
            tone="red"
            title="Build Your Personal Brand"
            text="Establish yourself as an authority in your niche. Customise your profile, showcase expertise and grow a recognisable coaching brand online."
          />
        </div>

        <p className="features-group-title">
          <i className="fas fa-heartbeat" /> For your clients&apos; health &amp;
          wellness
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
            <i className="fas fa-route" /> How It Works
          </div>
          <h2 className="section-title">
            Start Your Coaching Journey in 3 Simple Steps
          </h2>
          <p className="section-subtitle">
            Getting set up on Mera Coach takes minutes. Here&apos;s how coaches
            go from sign-up to fully running their practice.
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
              Build your business page (your personal website), define your
              coaching services and upload your success stories. Your profile is
              your digital storefront. Make it shine.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>Start Managing Clients</h3>
            <p>
              Begin adding clients, tracking their progress and managing leads
              from one clean dashboard. Watch your coaching practice grow, day
              by day.
            </p>
          </div>
        </div>
        <div className="steps-cta">
          <Link href="/register" className="btn btn-gold">
            <i className="fas fa-user-tie" /> Register as a Coach
          </Link>
        </div>
      </div>
    </section>
  );
}
