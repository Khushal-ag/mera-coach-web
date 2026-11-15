"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { ServiceProgramId } from "@/constants/services-programs";

import { siteConfig } from "@/config/site";
import {
  programFromHash,
  SERVICE_PROGRAMS,
  SERVICE_TOOLS,
} from "@/constants/services-programs";
import { cn } from "@/lib/utils";

/** Links under the programme tabs that jump to the platform tools further down the page. */
/** How long a click on a tab keeps the scroll tracking quiet while the page scrolls there. */
const SCROLL_LOCK_MS = 1500;

/** The band of the screen that counts as "being read": below the site bar and this strip, above the lower 60%. */
const TOOL_SPY_MARGIN = "-140px 0px -60% 0px";

const TOOL_LINKS = SERVICE_TOOLS.map((tool) => ({
  id: tool.id,
  icon: tool.icon,
  label: tool.tabLabel,
}));

/** Every element with this id: the page can hold a hidden streaming copy next to the visible one. */
const allWithId = (id: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`[id="${id}"]`));

/**
 * The tab strip under "Complete Health & Coaching Services" and the programme details it opens. The tiles in the
 * hero link here too (/services#diet), so a click on a tile or a tab shows the same details.
 */
export function ServicePrograms() {
  const [selected, setSelected] = useState<ServiceProgramId>("exercise");
  // The tool being read further down the page (null while the programme details are the focus).
  const [tool, setTool] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  // A click or a link sets the tab; the scroll tracking below stays out of the way while the page scrolls there.
  const lockedUntil = useRef(0);

  function pickTool(id: string | null) {
    lockedUntil.current = Date.now() + SCROLL_LOCK_MS;
    setTool(id);
  }

  useEffect(() => {
    const showHashProgram = () => {
      const hash = window.location.hash.slice(1);
      if (TOOL_LINKS.some((link) => link.id === hash)) {
        pickTool(hash);
        return;
      }
      const id = programFromHash(window.location.hash);
      if (!id) return;
      setSelected(id);
      pickTool(null);
      requestAnimationFrame(() => panelRef.current?.scrollIntoView());
    };
    showHashProgram();
    window.addEventListener("hashchange", showHashProgram);
    return () => window.removeEventListener("hashchange", showHashProgram);
  }, []);

  // While scrolling by hand, highlight the first tool card in the upper part of the screen (the tool cards sit two
  // or three to a row), and the programme tab again once the programme details are back there. The top margin
  // clears the site bar and this strip.
  useEffect(() => {
    const inView = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        if (Date.now() < lockedUntil.current) return;
        const ids = new Set([...inView].map((element) => element.id));
        const first = TOOL_LINKS.find((link) => ids.has(link.id));
        if (first) setTool(first.id);
        else if (ids.has("coaching")) setTool(null);
      },
      { rootMargin: TOOL_SPY_MARGIN },
    );
    for (const id of ["coaching", ...TOOL_LINKS.map((link) => link.id)])
      allWithId(id).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function choose(id: ServiceProgramId) {
    setSelected(id);
    pickTool(null);
    window.history.replaceState(null, "", `#${id}`);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const program =
    SERVICE_PROGRAMS.find((item) => item.id === selected) ??
    SERVICE_PROGRAMS[0]!;

  return (
    <>
      <div className="sv-quicknav">
        <div className="container">
          <div
            className="sv-qn-list"
            role="tablist"
            aria-label="Coaching programs"
          >
            {SERVICE_PROGRAMS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`sv-tab-${item.id}`}
                aria-selected={tool === null && item.id === selected}
                aria-controls="sv-program-panel"
                className={cn(
                  "sv-qn-item",
                  tool === null && item.id === selected && "is-active",
                )}
                onClick={() => choose(item.id)}
              >
                <i className={item.icon} /> {item.title}
              </button>
            ))}
            {TOOL_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={cn("sv-qn-item", tool === link.id && "is-active")}
                aria-current={tool === link.id ? "location" : undefined}
                onClick={() => pickTool(link.id)}
              >
                <i className={link.icon} /> {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section className="sv-programs" id="coaching" ref={panelRef}>
        <div className="container">
          <div
            role="tabpanel"
            id="sv-program-panel"
            aria-labelledby={`sv-tab-${program.id}`}
            className="sv-prog-panel"
          >
            <div className="sv-prog-card" key={program.id}>
              <div className={`sv-pc-header sv-pc-${program.tone}`}>
                <div className="sv-pc-icon-wrap">
                  <i className={program.icon} />
                </div>
                <div className="sv-pc-head-text">
                  <span className="sv-pc-label">{program.label}</span>
                  <h3>{program.title}</h3>
                </div>
              </div>
              <div className="sv-pc-body">
                <p className="sv-pc-desc">{program.description}</p>
                <ul className="sv-pc-features">
                  {program.features.map((feature) => (
                    <li key={feature}>
                      <i
                        className={`fas fa-check-circle sv-check-${program.tone}`}
                      />{" "}
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="sv-pc-tags">
                  {program.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="sv-pc-footer">
                <Link
                  href={siteConfig.links.coaches}
                  className={`btn sv-pc-btn sv-pcbtn-${program.tone}`}
                >
                  <i className="fas fa-user-check" /> {program.findLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
