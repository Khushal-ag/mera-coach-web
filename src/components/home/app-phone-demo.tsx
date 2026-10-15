"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const SCREENS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "add", label: "Add client" },
  { id: "bmi", label: "Body composition" },
  { id: "diet", label: "Diet plan" },
] as const;

const SCREEN_MS = 8200;

/** Outline icons in the style of the app's Ionicons tab bar. */
function TabIcon({ name }: { name: "grid" | "cube" | "calendar" | "person" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "grid")
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6.5" height="6.5" rx="1.2" />
        <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" />
        <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" />
        <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" />
      </svg>
    );
  if (name === "cube")
    return (
      <svg {...common}>
        <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2L12 3Z" />
        <path d="m4 7.2 8 4.3 8-4.3M12 11.5V21" />
      </svg>
    );
  if (name === "calendar")
    return (
      <svg {...common}>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
        <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
    </svg>
  );
}

function Ico({ name }: { name: string }) {
  return <i className={`fas fa-${name}`} aria-hidden />;
}

function WaveHeader() {
  return (
    <header className="apd-wave">
      <span className="apd-circle">
        <Ico name="chevron-left" />
      </span>
      <span className="apd-wave-title">Add Client</span>
      <span className="apd-circle">
        <Ico name="home" />
      </span>
    </header>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="apd-sec">
      <h3>{children}</h3>
      <span />
    </div>
  );
}

/**
 * Animated phone that plays through the coach app using the app's real
 * screens: Dashboard, Add Client, Body composition and the Diet plan step.
 * Each screen replays its animation when it becomes active. With reduced
 * motion it stays on one screen, fully drawn.
 */
export function AppPhoneDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!playing || !visible || reduced.matches) return;
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % SCREENS.length),
      SCREEN_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, playing, visible]);

  const current = SCREENS[active]!;
  // Every demo screen lives under the Dashboard tab.
  const tab = 0;

  return (
    <div className="apd" ref={rootRef}>
      <div className="apd-glow" aria-hidden />

      <div className="apd-floaters" aria-hidden>
        <span className="apd-floater apd-floater-a" key={`a-${active}`}>
          <Ico name="user-plus" /> New lead
        </span>
        <span className="apd-floater apd-floater-b" key={`b-${active}`}>
          <Ico name="file-pdf" /> Report ready
        </span>
        <span className="apd-floater apd-floater-c" key={`c-${active}`}>
          <Ico name="bell" /> Check-up due
        </span>
      </div>

      <div
        className="apd-phone"
        role="group"
        aria-label={`Mera Coach app preview: ${current.label}`}
      >
        <div className="apd-notch" aria-hidden />
        <div
          className={cn("apd-status", active !== 0 && "apd-status-light")}
          aria-hidden
        >
          <span>9:41</span>
          <span className="apd-status-icons">
            <Ico name="signal" />
            <Ico name="wifi" />
            <Ico name="battery-full" />
          </span>
        </div>

        <div className="apd-screens">
          {/* 1. Dashboard */}
          <section
            className={cn("apd-screen apd-bg-app", active === 0 && "is-active")}
            aria-hidden={active !== 0}
          >
            <div className="apd-body apd-dash">
              <div className="apd-dash-scroll">
                <div className="apd-topbar">
                  <div>
                    <p className="apd-brand">
                      <span>Mera</span>
                      <b>Coach</b>
                    </p>
                    <p className="apd-guide">
                      Guide <i>•</i> Support <i>•</i> transform
                    </p>
                  </div>
                  <div className="apd-actions">
                    <span className="apd-act">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M3.5 11 12 4l8.5 7M6 9.8V20h12V9.8" />
                      </svg>
                    </span>
                    <span className="apd-act apd-bell">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2H4.5l1.5-2ZM10 21h4" />
                      </svg>
                    </span>
                    <span className="apd-avatar">
                      AS
                      <i />
                    </span>
                  </div>
                </div>
                <p className="apd-greet">Good morning</p>
                <p className="apd-name">Aarti Sharma</p>
                <p className="apd-sub">Clients, leads, and checkup</p>

                <div className="apd-strip">
                  <div className="apd-metric">
                    <span className="apd-mico apd-mico-g">
                      <Ico name="users" />
                    </span>
                    <b className="apd-count apd-count-128" />
                    <span>Clients</span>
                  </div>
                  <div className="apd-metric">
                    <span className="apd-mico apd-mico-a">
                      <Ico name="filter" />
                    </span>
                    <b className="apd-count apd-count-12" />
                    <span>Leads</span>
                  </div>
                  <div className="apd-metric">
                    <span className="apd-mico apd-mico-r">
                      <Ico name="calendar-alt" />
                    </span>
                    <b className="apd-count apd-count-7" />
                    <span>Due</span>
                  </div>
                </div>

                <div className="apd-pc">
                  <div className="apd-pc-top">
                    <span className="apd-pc-ico">
                      <Ico name="eye-slash" />
                    </span>
                    <span className="apd-pc-copy">
                      <b>Complete profile to go public</b>
                      <small>
                        Finish the required fields to appear on Find a Coach.
                      </small>
                    </span>
                    <em>72%</em>
                  </div>
                  <div className="apd-pc-track">
                    <span />
                  </div>
                </div>

                <div className="apd-cta">
                  <span className="apd-cta-ico">
                    <Ico name="user-plus" />
                  </span>
                  <span className="apd-cta-copy">
                    <b>Add Client</b>
                    <small>Start a new assessment</small>
                  </span>
                  <Ico name="arrow-right" />
                </div>

                <div className="apd-quick">
                  <div className="apd-qc apd-qc-g">
                    <span>
                      <Ico name="users" />
                    </span>
                    <b>My Clients</b>
                    <small>View &amp; manage your clients</small>
                  </div>
                  <div className="apd-qc apd-qc-b">
                    <span>
                      <Ico name="filter" />
                    </span>
                    <b>Leads</b>
                    <small>Track &amp; convert Leads</small>
                  </div>
                  <div className="apd-qc apd-qc-p">
                    <span>
                      <Ico name="clipboard" />
                    </span>
                    <b>Checkups</b>
                    <small>View upcoming checkups</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Add client */}
          <section
            className={cn("apd-screen apd-bg-wiz", active === 1 && "is-active")}
            aria-hidden={active !== 1}
          >
            <WaveHeader />
            <div className="apd-body apd-form-body">
              <div className="apd-scroll apd-scroll-form">
                <h3 className="apd-title">Personal &amp; Body Stats</h3>
                <span className="apd-uline" />
                <p className="apd-muted">Client&apos;s basic details</p>
                <div className="apd-card">
                  <div className="apd-f">
                    <label>
                      Full Name <i>*</i>
                    </label>
                    <div className="apd-in">
                      <Ico name="user" />
                      <span className="apd-type apd-type-name">
                        Rekha Verma
                      </span>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>
                      Mobile Number <i>*</i>
                    </label>
                    <div className="apd-in">
                      <Ico name="phone-alt" />
                      <span className="apd-type apd-type-mobile">
                        9898659865
                      </span>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>Email (optional)</label>
                    <div className="apd-in apd-in-empty">
                      <Ico name="envelope" />
                      <span>client@gmail.com</span>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>Age</label>
                    <div className="apd-in">
                      <Ico name="calendar-alt" />
                      <span className="apd-type apd-type-age">34</span>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>
                      Gender <i>*</i>
                    </label>
                    <div className="apd-pills">
                      <span className="apd-pill">Male</span>
                      <span className="apd-pill apd-pill-pick">Female</span>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>
                      Height <i>*</i>
                    </label>
                    <div className="apd-in">
                      <span className="apd-type apd-type-h">162</span>
                      <em>cm</em>
                    </div>
                  </div>
                  <div className="apd-f">
                    <label>
                      Weight (kg) <i>*</i>
                    </label>
                    <div className="apd-in">
                      <Ico name="weight" />
                      <span className="apd-type apd-type-w">58</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="apd-foot">
                <span className="apd-next">
                  Next
                  <span className="apd-next-arrow">
                    <Ico name="arrow-right" />
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* 3. Body composition */}
          <section
            className={cn("apd-screen apd-bg-wiz", active === 2 && "is-active")}
            aria-hidden={active !== 2}
          >
            <WaveHeader />
            <div className="apd-body">
              <div className="apd-scroll apd-scroll-bmi">
                <SectionTitle>Body composition</SectionTitle>
                <div className="apd-tiles">
                  <div className="apd-tile apd-tile-1">
                    <small className="apd-cap">BMI</small>
                    <b className="apd-bmi apd-count apd-count-bmi" />
                    <span className="apd-badge">Normal</span>
                  </div>
                  <div className="apd-tile apd-tile-2">
                    <Ico name="heart" />
                    <b>27%</b>
                    <span>Body Fat</span>
                    <small>Deurenberg formula</small>
                  </div>
                  <div className="apd-tile apd-tile-3">
                    <Ico name="fire" />
                    <b>5</b>
                    <span>Visceral Fat</span>
                    <small>Level 1-59 (normal: 1-12)</small>
                  </div>
                  <div className="apd-tile apd-tile-4">
                    <Ico name="dumbbell" />
                    <b>31%</b>
                    <span>Skeletal Muscle</span>
                    <small>Hume LBM formula</small>
                  </div>
                  <div className="apd-tile apd-tile-5">
                    <Ico name="bolt" />
                    <b>1320 kcal</b>
                    <span>Resting Metabolism</span>
                    <small>Mifflin-St Jeor</small>
                  </div>
                  <div className="apd-tile apd-tile-6">
                    <Ico name="calendar-alt" />
                    <b>33 yrs</b>
                    <span>Body Age</span>
                    <small>Based on fat% vs ideal</small>
                  </div>
                </div>
              </div>
              <div className="apd-foot">
                <span className="apd-next">
                  Next
                  <span className="apd-next-arrow">
                    <Ico name="arrow-right" />
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* 4. Diet plan */}
          <section
            className={cn("apd-screen apd-bg-wiz", active === 3 && "is-active")}
            aria-hidden={active !== 3}
          >
            <WaveHeader />
            <div className="apd-body">
              <div className="apd-empty">
                <span className="apd-empty-ico">
                  <Ico name="utensils" />
                </span>
                <b>No plan yet</b>
                <small>
                  Generate a plan from this client&apos;s assessment.
                </small>
                <span className="apd-gen">
                  <Ico name="magic" /> Generate diet plan
                </span>
              </div>
              <div className="apd-scroll apd-scroll-diet">
                <SectionTitle>Summary</SectionTitle>
                <div className="apd-card apd-sum">
                  <div className="apd-bar apd-bar-y apd-bar-1">
                    <Ico name="heartbeat" />
                    <span>BMI</span>
                    <b>22.1</b>
                  </div>
                  <div className="apd-bar apd-bar-m apd-bar-2">
                    <Ico name="award" />
                    <span>Category</span>
                    <b>Normal</b>
                  </div>
                  <div className="apd-bar apd-bar-m apd-bar-3">
                    <Ico name="fire" />
                    <span>Daily calories</span>
                    <b>
                      <em className="apd-count apd-count-kcal" /> kcal
                    </b>
                  </div>
                </div>
                <SectionTitle>Weekly Plan</SectionTitle>
                <div className="apd-card apd-meal">
                  <p className="apd-meal-title">Breakfast</p>
                  <div className="apd-bar apd-bar-m">
                    <Ico name="clock" />
                    <span>Time</span>
                    <b>7:30 AM</b>
                  </div>
                  <div className="apd-opts">
                    <p>
                      <Ico name="utensils" /> Options
                    </p>
                    <span>1. 2 idli with sambar and chutney</span>
                    <span>2. Vegetable poha with curd</span>
                  </div>
                  <div className="apd-bar apd-bar-m">
                    <Ico name="fire" />
                    <span>Calories</span>
                    <b>280-320</b>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <nav className="apd-tabs" aria-hidden>
          {(
            [
              ["grid", "Dashboard"],
              ["cube", "Packages"],
              ["calendar", "Events"],
              ["person", "Profile"],
            ] as const
          ).map(([icon, label], index) => (
            <span
              key={label}
              className={cn("apd-tab", index === tab && "apd-tab-on")}
            >
              <TabIcon name={icon} />
              {label}
            </span>
          ))}
        </nav>
        <div className="apd-home" aria-hidden />
      </div>

      <div className="apd-controls">
        <div className="apd-dots" role="tablist" aria-label="App screens">
          {SCREENS.map((screen, index) => (
            <button
              key={screen.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={screen.label}
              className={cn("apd-dotbtn", index === active && "is-on")}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="apd-toggle"
          aria-label={playing ? "Pause preview" : "Play preview"}
          onClick={() => setPlaying((p) => !p)}
        >
          <Ico name={playing ? "pause" : "play"} />
        </button>
      </div>
    </div>
  );
}
