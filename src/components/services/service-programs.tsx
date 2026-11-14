"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { ServiceProgramId } from "@/constants/services-programs";

import {
  programFromHash,
  SERVICE_PROGRAMS,
} from "@/constants/services-programs";
import { cn } from "@/lib/utils";

/** Links under the programme tabs that jump to the platform tools further down the page. */
const TOOL_LINKS = [
  { href: "#profiles", icon: "fas fa-id-card", label: "Client Profiles" },
  {
    href: "#assessments",
    icon: "fas fa-heartbeat",
    label: "Health Assessments",
  },
  { href: "#reports", icon: "fas fa-chart-bar", label: "Reports" },
];

/**
 * The tab strip under "Complete Health & Coaching Services" and the programme details it opens. The tiles in the
 * hero link here too (/services#diet), so a click on a tile or a tab shows the same details.
 */
export function ServicePrograms() {
  const [selected, setSelected] = useState<ServiceProgramId>("exercise");
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const showHashProgram = () => {
      const id = programFromHash(window.location.hash);
      if (!id) return;
      setSelected(id);
      requestAnimationFrame(() => panelRef.current?.scrollIntoView());
    };
    showHashProgram();
    window.addEventListener("hashchange", showHashProgram);
    return () => window.removeEventListener("hashchange", showHashProgram);
  }, []);

  function choose(id: ServiceProgramId) {
    setSelected(id);
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
                aria-selected={item.id === selected}
                aria-controls="sv-program-panel"
                className={cn(
                  "sv-qn-item",
                  item.id === selected && "is-active",
                )}
                onClick={() => choose(item.id)}
              >
                <i className={item.icon} /> {item.title}
              </button>
            ))}
            {TOOL_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="sv-qn-item">
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
                  href="/coach"
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
