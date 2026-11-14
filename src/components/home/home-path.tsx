"use client";

import { useEffect, useRef, useState } from "react";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Path = "coach" | "member";

/** The section with this id inside the panels, and the path it belongs to (for links such as /#bmi). */
function findInPanels(
  panels: HTMLElement | null,
  id: string,
): { element: HTMLElement; owner: Path } | null {
  if (!panels || !id) return null;
  const element = panels.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  const owner =
    element?.closest<HTMLElement>("[data-path-panel]")?.dataset.pathPanel;
  return element && (owner === "coach" || owner === "member") ?
      { element, owner }
    : null;
}

function hashId(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

/**
 * "Choose Your Path": two cards side by side. Picking one shows that audience's sections below the cards, the coach
 * tools for coaches and the coach directory, categories and BMI for members. Both panels are in the page, so a link to
 * a section inside either one still works.
 */
export function HomePath({
  coachPanel,
  memberPanel,
}: {
  coachPanel: ReactNode;
  memberPanel: ReactNode;
}) {
  const [path, setPath] = useState<Path>("coach");
  const panelsRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<Record<Path, HTMLButtonElement | null>>({
    coach: null,
    member: null,
  });

  useEffect(() => {
    let retry: number | undefined;
    const showHashTarget = (attempt = 0) => {
      const id = hashId();
      if (!id) return;
      const found = findInPanels(panelsRef.current, id);
      if (!found) {
        // The section may still be streaming in, so look again for a moment.
        if (attempt < 10)
          retry = window.setTimeout(() => showHashTarget(attempt + 1), 200);
        return;
      }
      setPath(found.owner);
      // The panel is still hidden for this render, so scroll once it has opened.
      window.setTimeout(() => found.element.scrollIntoView(), 100);
    };
    const onHashChange = () => {
      window.clearTimeout(retry);
      showHashTarget();
    };
    showHashTarget();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.clearTimeout(retry);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  function choose(next: Path) {
    setPath(next);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    panelsRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  /** A click anywhere on a card picks its path; the button inside is the keyboard and screen-reader control. */
  function onCardClick(event: MouseEvent<HTMLDivElement>, next: Path) {
    if ((event.target as HTMLElement).closest("button")) return;
    choose(next);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: Path) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next: Path = current === "coach" ? "member" : "coach";
    setPath(next);
    tabs.current[next]?.focus();
  }

  return (
    <>
      <section className="choose-path" id="about">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">
              <i className="fas fa-compass" /> Who Are You Here For?
            </div>
            <h2 className="section-title">Choose Your Path</h2>
            <p className="section-subtitle">
              Mera Coach serves both coaches and members. Pick your path and let
              us do the rest.
            </p>
          </div>
          <div
            className="path-grid"
            role="tablist"
            aria-label="Choose your path"
          >
            <div
              className={cn(
                "path-card path-card-coach",
                path === "coach" && "is-active",
              )}
              role="presentation"
              onClick={(event) => onCardClick(event, "coach")}
            >
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
                  Run, grow and scale your coaching practice, from client
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
                    <i className="fas fa-check-circle" /> Your own business page
                    / personal website
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
                <button
                  type="button"
                  role="tab"
                  id="path-tab-coach"
                  aria-selected={path === "coach"}
                  aria-controls="path-panel-coach"
                  tabIndex={path === "coach" ? 0 : -1}
                  ref={(node) => {
                    tabs.current.coach = node;
                  }}
                  className="path-cta path-cta-coach"
                  onClick={() => choose("coach")}
                  onKeyDown={(event) => onKeyDown(event, "coach")}
                >
                  <i className="fas fa-rocket" /> Start as a Coach{" "}
                  <i className="fas fa-arrow-down" />
                </button>
              </div>
            </div>
            <div
              className={cn(
                "path-card path-card-member",
                path === "member" && "is-active",
              )}
              role="presentation"
              onClick={(event) => onCardClick(event, "member")}
            >
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
                <button
                  type="button"
                  role="tab"
                  id="path-tab-member"
                  aria-selected={path === "member"}
                  aria-controls="path-panel-member"
                  tabIndex={path === "member" ? 0 : -1}
                  ref={(node) => {
                    tabs.current.member = node;
                  }}
                  className="path-cta path-cta-member"
                  onClick={() => choose("member")}
                  onKeyDown={(event) => onKeyDown(event, "member")}
                >
                  <i className="fas fa-search" /> Find a Coach{" "}
                  <i className="fas fa-arrow-down" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="path-panels" ref={panelsRef}>
        <div
          role="tabpanel"
          id="path-panel-coach"
          aria-labelledby="path-tab-coach"
          data-path-panel="coach"
          hidden={path !== "coach"}
        >
          {coachPanel}
        </div>
        <div
          role="tabpanel"
          id="path-panel-member"
          aria-labelledby="path-tab-member"
          data-path-panel="member"
          hidden={path !== "member"}
        >
          {memberPanel}
        </div>
      </div>
    </>
  );
}
