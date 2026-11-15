"use client";

import { useEffect, useRef, useState } from "react";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import type { PathId as Path } from "@/constants/home-platform";

import {
  PATH_CARDS,
  PATH_HASH_RETRY,
  PATH_SECTION,
} from "@/constants/home-platform";
import { unsplash } from "@/constants/images";
import { cn } from "@/lib/utils";

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
  const panels: Record<Path, ReactNode> = {
    coach: coachPanel,
    member: memberPanel,
  };

  useEffect(() => {
    let retry: number | undefined;
    const showHashTarget = (attempt = 0) => {
      const id = hashId();
      if (!id) return;
      const found = findInPanels(panelsRef.current, id);
      if (!found) {
        // The section may still be streaming in, so look again for a moment.
        if (attempt < PATH_HASH_RETRY.attempts)
          retry = window.setTimeout(
            () => showHashTarget(attempt + 1),
            PATH_HASH_RETRY.everyMs,
          );
        return;
      }
      setPath(found.owner);
      // The panel is still hidden for this render, so scroll once it has opened.
      window.setTimeout(
        () => found.element.scrollIntoView(),
        PATH_HASH_RETRY.scrollDelayMs,
      );
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
              <i className="fas fa-compass" /> {PATH_SECTION.tag}
            </div>
            <h2 className="section-title">{PATH_SECTION.title}</h2>
            <p className="section-subtitle">{PATH_SECTION.subtitle}</p>
          </div>
          <div
            className="path-grid"
            role="tablist"
            aria-label="Choose your path"
          >
            {PATH_CARDS.map((card) => (
              <div
                key={card.id}
                className={cn(
                  `path-card path-card-${card.id}`,
                  path === card.id && "is-active",
                )}
                role="presentation"
                onClick={(event) => onCardClick(event, card.id)}
              >
                <div className="path-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={unsplash(card.photo, { width: 800, quality: 85 })}
                    alt={card.photoAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="path-overlay" />
                <div className="path-content">
                  <div className="path-icon-wrap">
                    <i className={card.icon} />
                  </div>
                  <div className={`path-pill path-pill-${card.id}`}>
                    <i className={card.pillIcon} /> {card.pill}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <ul className="path-features">
                    {card.features.map((feature) => (
                      <li key={feature}>
                        <i className="fas fa-check-circle" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    role="tab"
                    id={`path-tab-${card.id}`}
                    aria-selected={path === card.id}
                    aria-controls={`path-panel-${card.id}`}
                    tabIndex={path === card.id ? 0 : -1}
                    ref={(node) => {
                      tabs.current[card.id] = node;
                    }}
                    className={`path-cta path-cta-${card.id}`}
                    onClick={() => choose(card.id)}
                    onKeyDown={(event) => onKeyDown(event, card.id)}
                  >
                    <i className={card.ctaIcon} /> {card.ctaLabel}{" "}
                    <i className="fas fa-arrow-down" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="path-panels" ref={panelsRef}>
        {PATH_CARDS.map((card) => (
          <div
            key={card.id}
            role="tabpanel"
            id={`path-panel-${card.id}`}
            aria-labelledby={`path-tab-${card.id}`}
            data-path-panel={card.id}
            hidden={path !== card.id}
          >
            {panels[card.id]}
          </div>
        ))}
      </div>
    </>
  );
}
